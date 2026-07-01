'use strict';

const statusLabels = {
  available: '사용 가능',
  preview: '미리 보기',
  'coming-soon': '준비 중'
};

const accentColors = {
  cyan: '#4ed7e8',
  violet: '#9673ff'
};

function createAgentCard(agent) {
  const card = document.createElement('article');
  card.className = 'agent-card';
  card.style.setProperty('--accent', accentColors[agent.accent] || accentColors.violet);

  const initial = document.createElement('span');
  initial.className = 'agent-icon';
  initial.textContent = agent.name.slice(0, 1);

  const badge = document.createElement('span');
  badge.className = 'badge';
  badge.textContent = statusLabels[agent.status] || agent.status;

  const top = document.createElement('div');
  top.className = 'card-top';
  top.append(initial, badge);

  const title = document.createElement('h3');
  title.textContent = agent.name;

  const description = document.createElement('p');
  description.textContent = agent.description;

  const owner = document.createElement('span');
  owner.textContent = `OWNER · ${agent.owner}`;

  const version = document.createElement('span');
  version.textContent = `V${agent.version}`;

  const footer = document.createElement('div');
  footer.className = 'card-footer';
  footer.append(owner, version);

  card.append(top, title, description, footer);
  return card;
}

async function loadAgents() {
  const grid = document.querySelector('#agent-grid');
  const count = document.querySelector('#agent-count');

  try {
    const response = await fetch('/api/agents');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const agents = await response.json();

    grid.replaceChildren(...agents.map(createAgentCard));
    count.textContent = `${agents.length} agents registered`;
  } catch (error) {
    grid.textContent = 'Agent 목록을 불러오지 못했습니다.';
    count.textContent = 'Agent catalog unavailable';
    console.error(error);
  }
}

loadAgents();

