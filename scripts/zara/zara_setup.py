"""Create or update Zara on Claude Managed Agents.

First run: uploads the hayakkom-knowledge skill, creates the zara-env environment and the Zara agent from the
zara-agent package (agents/zara/agent.md, agents/zara/environment.yaml, skills/hayakkom-knowledge/) and records the
IDs in zara_ids.json next to this script.
With --update: uploads the skill folder as a new skill version and publishes a new agent version (prompt, tools,
pinned skill version) on the same agent ID. Sessions already running keep the version they started with.

The package itself (Zara's instructions and knowledge files) is not stored in this repository.
The API key is read from the ZARA_API_KEY environment variable.

Usage: python zara_setup.py <path-to-zara-agent-dir> [--update]
"""
import json
import os
import sys
from pathlib import Path

import anthropic
import yaml
from anthropic.lib import files_from_dir

PKG = Path(sys.argv[1]).resolve()
UPDATE = "--update" in sys.argv[2:]
STATE = Path(__file__).with_name("zara_ids.json")
state = json.loads(STATE.read_text()) if STATE.exists() else {}

client = anthropic.Anthropic(api_key=os.environ["ZARA_API_KEY"])
SKILL_DIR = PKG / "skills" / "hayakkom-knowledge"


def save():
    STATE.write_text(json.dumps(state, indent=2) + "\n")


def agent_fields():
    raw = (PKG / "agents" / "zara" / "agent.md").read_text()
    _, front, body = raw.split("---", 2)
    meta = yaml.safe_load(front)
    return dict(
        name=meta["name"],
        description=meta["description"],
        model=meta["model"],
        system=body.strip(),
        tools=meta["tools"],
        skills=[{"type": "custom", "skill_id": state["skill_id"], "version": state["skill_version"]}],
    )


# 1. Skill (knowledge pack)
if "skill_id" not in state:
    skill = client.skills.create(files=files_from_dir(SKILL_DIR), display_name="hayakkom-knowledge")
    state["skill_id"] = skill.id
    state["skill_version"] = skill.latest_version_id
    save()
    print("skill created:", skill.id, "version", state["skill_version"])
elif UPDATE:
    sv = client.skills.versions.create(state["skill_id"], files=files_from_dir(SKILL_DIR))
    state["skill_version"] = sv.id
    save()
    print("skill version created:", sv.id)

# 2. Environment
if "environment_id" not in state:
    env_cfg = yaml.safe_load((PKG / "agents" / "zara" / "environment.yaml").read_text())
    env = client.beta.environments.create(name=env_cfg["name"], config=env_cfg["config"])
    state["environment_id"] = env.id
    save()
    print("environment created:", env.id)

# 3. Agent
if "agent_id" not in state:
    agent = client.beta.agents.create(**agent_fields())
    state["agent_id"], state["agent_version"] = agent.id, agent.version
    save()
    print("agent created:", agent.id, "version", agent.version)
elif UPDATE:
    agent = client.beta.agents.update(state["agent_id"], version=state["agent_version"], **agent_fields())
    state["agent_version"] = agent.version
    save()
    print("agent updated:", agent.id, "version", agent.version)
else:
    print("nothing to do: Zara exists (use --update to publish a new version)")
