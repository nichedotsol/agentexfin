const agents = {
  mira: {
    name: "Mira",
    runtime: "Hermes connected",
    subtitle: "working with $42",
    color: "var(--blue)",
  },
  atlas: {
    name: "Atlas",
    runtime: "OpenClaw connected",
    subtitle: "resting with $15",
    color: "var(--amber)",
  },
  ops: {
    name: "Ops",
    runtime: "Agentex created",
    subtitle: "waiting on a $50 move",
    color: "var(--coral)",
  },
};

const scrim = document.querySelector("#scrim");
const agentSheet = document.querySelector("#agentSheet");
const actionSheet = document.querySelector("#actionSheet");
const scoreSheet = document.querySelector("#scoreSheet");
const agentButtons = document.querySelectorAll(".agent-object");
const simulationBlock = document.querySelector("#simulationBlock");
const actionMode = document.querySelector("#actionMode");
const actionTitle = document.querySelector("#actionTitle");
const actionSubtitle = document.querySelector("#actionSubtitle");
const whyCopy = document.querySelector("#whyCopy");
const slider = document.querySelector("#approvalSlider");
const thumb = document.querySelector("#sliderThumb");

let alwaysSimulate = true;
let draggingAgent = null;
let dragMoved = false;
let dragOffset = { x: 0, y: 0 };
let sliding = false;
let startX = 0;
let sliderMax = 0;

function openLayer(layer) {
  closeLayers();
  layer.classList.add("is-open");
  layer.setAttribute("aria-hidden", "false");
  scrim.classList.add("is-open");
}

function closeLayers() {
  [agentSheet, actionSheet, scoreSheet].forEach((layer) => {
    layer.classList.remove("is-open");
    layer.setAttribute("aria-hidden", "true");
  });
  scrim.classList.remove("is-open");
  agentButtons.forEach((button) => button.classList.remove("is-selected"));
  resetSlider();
}

function openAgent(agentKey) {
  const agent = agents[agentKey];
  document.querySelector("#agentTitle").textContent = agent.name;
  document.querySelector("#agentRuntime").textContent = agent.runtime;
  document.querySelector("#agentSubtitle").textContent = agent.subtitle;
  document.querySelector("#miniAgent").style.background = agent.color;
  document.querySelector(`[data-agent="${agentKey}"]`).classList.add("is-selected");
  openLayer(agentSheet);
}

function prepareAction(command = "") {
  const normalized = command.toLowerCase();
  const isFunding = normalized.includes("mira") || normalized.includes("fund");
  const isReview = normalized.includes("spent") || normalized.includes("review");

  if (isReview) {
    actionMode.textContent = "Briefing";
    actionTitle.textContent = "Today's agent activity";
    actionSubtitle.textContent = "Mira spent $2.13. Atlas returned $3.12. Ops needs approval.";
  } else if (isFunding) {
    actionMode.textContent = alwaysSimulate ? "Simulation" : "Prepared action";
    actionTitle.textContent = "Give Mira 20 USDC";
    actionSubtitle.textContent = "For research this week";
  } else {
    actionMode.textContent = alwaysSimulate ? "Simulation" : "Prepared action";
    actionTitle.textContent = "Move 50 USDC";
    actionSubtitle.textContent = "From Base to Solana";
  }

  simulationBlock.classList.toggle("is-visible", alwaysSimulate);
  document.querySelector("#simulateButton").textContent = alwaysSimulate
    ? "Simulation on"
    : "Simulate";
  openLayer(actionSheet);
}

function resetSlider() {
  sliding = false;
  if (!thumb || !slider) return;
  thumb.style.transform = "translateX(0)";
  slider.classList.remove("is-approved");
  slider.querySelector(".slider-track").textContent = "Slide to approve";
}

function approveAction() {
  slider.classList.add("is-approved");
  slider.querySelector(".slider-track").textContent = "Approved - executing now";
  thumb.style.transform = `translateX(${sliderMax}px)`;
  document.querySelector("#briefText").textContent = "Approved. Ops is moving funds now.";
  setTimeout(() => {
    closeLayers();
  }, 1100);
}

function pointerX(event) {
  return event.touches ? event.touches[0].clientX : event.clientX;
}

agentButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (dragMoved) return;
    openAgent(button.dataset.agent);
  });

  button.addEventListener("pointerdown", (event) => {
    draggingAgent = button;
    dragMoved = false;
    const rect = button.getBoundingClientRect();
    dragOffset = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    button.setPointerCapture(event.pointerId);
  });

  button.addEventListener("pointermove", (event) => {
    if (draggingAgent !== button) return;
    const workspace = document.querySelector(".workspace").getBoundingClientRect();
    const x = event.clientX - workspace.left - dragOffset.x;
    const y = event.clientY - workspace.top - dragOffset.y;
    dragMoved = true;
    button.style.left = `${Math.max(0, Math.min(workspace.width - button.offsetWidth, x))}px`;
    button.style.top = `${Math.max(0, Math.min(workspace.height - button.offsetHeight, y))}px`;
    button.style.right = "auto";
    button.style.bottom = "auto";
  });

  button.addEventListener("pointerup", () => {
    setTimeout(() => {
      draggingAgent = null;
      dragMoved = false;
    }, 0);
  });
});

document.querySelector("#commandForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.querySelector("#commandInput");
  prepareAction(input.value);
  input.value = "";
});

document.querySelector("#agentCommandForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.querySelector("#agentCommandInput");
  prepareAction(input.value);
  input.value = "";
});

document.querySelectorAll("[data-command]").forEach((button) => {
  button.addEventListener("click", () => {
    prepareAction(button.dataset.command);
  });
});

document.querySelector("#scoreTray").addEventListener("click", () => openLayer(scoreSheet));
document.querySelector("#whyButton").addEventListener("click", () => {
  whyCopy.classList.toggle("is-visible");
});
document.querySelector("#simulateButton").addEventListener("click", () => {
  alwaysSimulate = !alwaysSimulate;
  simulationBlock.classList.toggle("is-visible", alwaysSimulate);
  actionMode.textContent = alwaysSimulate ? "Simulation" : "Prepared action";
  document.querySelector("#simulateButton").textContent = alwaysSimulate
    ? "Simulation on"
    : "Simulate";
});
document.querySelector("#detailsButton").addEventListener("click", () => {
  whyCopy.textContent = "Route: Circle CCTP. Proof links appear after the movement completes.";
  whyCopy.classList.add("is-visible");
});

["#closeAgent", "#closeAction", "#closeScore"].forEach((selector) => {
  document.querySelector(selector).addEventListener("click", closeLayers);
});
scrim.addEventListener("click", closeLayers);

thumb.addEventListener("pointerdown", (event) => {
  sliding = true;
  startX = pointerX(event);
  sliderMax = slider.offsetWidth - thumb.offsetWidth - 11;
  thumb.setPointerCapture(event.pointerId);
});

thumb.addEventListener("pointermove", (event) => {
  if (!sliding) return;
  const dx = Math.max(0, Math.min(sliderMax, pointerX(event) - startX));
  thumb.style.transform = `translateX(${dx}px)`;
  if (dx > sliderMax * 0.82) {
    sliding = false;
    approveAction();
  }
});

thumb.addEventListener("pointerup", () => {
  if (!sliding) return;
  sliding = false;
  thumb.style.transform = "translateX(0)";
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeLayers();
});
