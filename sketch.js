let tabs = [
  { 
    id: 'email', 
    title: 'Email Rephrase', 
    content: '', 
    systemPrompt: 'You are an email rephrasing assistant.', 
    conversationHistory: [] 
  },
  { 
    id: 'thesis', 
    title: 'Thesis Brainstorm', 
    content: '', 
    systemPrompt: 'You are a thesis brainstorming assistant.', 
    conversationHistory: [] 
  },
  { 
    id: 'therapy', 
    title: 'Emotional Therapy', 
    content: '', 
    systemPrompt: 'You are an emotional therapy assistant.', 
    conversationHistory: [] 
  }
];

let activeTab = 'email';

const proxyURL = "https://replicate-api-proxy.glitch.me/create_n_get/";

function setup() {
  renderTabs();
}


function renderTabs() {
  const tabsList = document.getElementById('tabsList');
  const tabContent = document.getElementById('tabContent');

  tabsList.innerHTML = tabs
    .map(
      (tab, index) => `
    <div 
      class="tab-group ${tab.id === activeTab ? 'active' : ''}" 
      draggable="true" 
      ondragstart="handleDragStart(event, ${index})" 
      ondragover="handleDragOver(event, ${index})" 
      ondrop="handleDrop(event, ${index})"
    >
      <span class="tab-title" onclick="setActiveTab('${tab.id}')">${tab.title}</span>
      <div class="tab-actions">
        <button onclick="editTab('${tab.id}')">
          <img src="./Edit_light.svg" alt="Edit" class="icon">
        </button>
        <button onclick="deleteTab('${tab.id}')">
          <img src="./delete.svg" alt="Delete" class="icon">
        </button>
      </div>
    </div>
  `
    )
    .join('') + `<button class="add-tab-button" onclick="openNewTabDialog()">+ Add New</button>`;

  if (activeTab) {
    const currentTab = tabs.find((tab) => tab.id === activeTab);
    tabContent.innerHTML = currentTab
      ? `<div id="chat-container" class="chat-container">${currentTab.content}</div>`
      : '';
  } else {
    tabContent.innerHTML = '<p>No tabs available. Add a new assistant.</p>';
  }
}


function handleDragStart(event, index) {
  draggedTabIndex = index;
  event.currentTarget.classList.add('dragging'); // Add dragging style
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', index); // Set the dragged index
}

function handleDrop(event, targetIndex) {
  event.preventDefault();
  document.querySelectorAll('.dragging').forEach((el) => el.classList.remove('dragging')); // Remove dragging style
  const sourceIndex = draggedTabIndex;
  if (sourceIndex === null || sourceIndex === targetIndex) return;

  const [draggedTab] = tabs.splice(sourceIndex, 1);
  tabs.splice(targetIndex, 0, draggedTab);

  activeTab = tabs[targetIndex].id;
  renderTabs();
}


// Drag and Drop Handlers
let draggedTabIndex = null;

// Handle the drag start event
function handleDragStart(event, index) {
  draggedTabIndex = index;
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', index); // Set the dragged index
}

// Handle the drag over event
function handleDragOver(event, index) {
  event.preventDefault(); // Allow dropping by preventing the default behavior
  event.dataTransfer.dropEffect = 'move';
}

// Handle the drop event
function handleDrop(event, targetIndex) {
  event.preventDefault();
  const sourceIndex = draggedTabIndex;
  if (sourceIndex === null || sourceIndex === targetIndex) return;

  // Reorder tabs in the array
  const [draggedTab] = tabs.splice(sourceIndex, 1); // Remove the dragged tab
  tabs.splice(targetIndex, 0, draggedTab); // Insert the dragged tab at the target position

  // Update the active tab to reflect the new order
  activeTab = tabs[targetIndex].id;

  // Re-render the tabs
  renderTabs();
}



// Set Active Tab
function setActiveTab(tabId) {
  activeTab = tabId;
  renderTabs();
}

// Handle Sending a Message
function handleSend() {
  const input = document.getElementById('messageInput').value.trim();
  if (!input || !activeTab) return;

  const currentTab = tabs.find(tab => tab.id === activeTab);

  // Add user message to the tab's content and conversation history
  currentTab.content += `<div class="user-message">${input}</div>`;
  currentTab.conversationHistory.push({ role: "user", content: input });

  document.getElementById('messageInput').value = '';
  renderTabs();

  sendToAPI(currentTab); // Send the request
}

// Send Message to API
async function sendToAPI(currentTab) {
  const formattedHistory = formatHistoryForAPI(currentTab.conversationHistory);
  const loadingMessage = `<div class="bot-message">Loading...</div>`;
  currentTab.content += loadingMessage;
  renderTabs();

  try {
    const response = await getChatResponse(formattedHistory, currentTab.systemPrompt);
    
    // Replace loading message with the actual response
    currentTab.content = currentTab.content.replace(loadingMessage, `<div class="bot-message">${response}</div>`);
    currentTab.conversationHistory.push({ role: "assistant", content: response });
    renderTabs();
  } catch (error) {
    console.error('Error:', error);
    currentTab.content = currentTab.content.replace(loadingMessage, `<div class="bot-message">Error occurred</div>`);
    renderTabs();
  }
}

// Format Conversation History for API
function formatHistoryForAPI(history) {
  let formattedHistory = "<|begin_of_text|>";
  history.forEach(message => {
    formattedHistory += message.role === "user" 
      ? `<|start_header_id|>user<|end_header_id|>\n${message.content}<|eot_id|>` 
      : `<|start_header_id|>assistant<|end_header_id|>\n${message.content}<|eot_id|>`;
  });
  formattedHistory += `<|start_header_id|>assistant<|end_header_id|>`; // Expected assistant response
  return formattedHistory;
}

// Get Chat Response from API
async function getChatResponse(history, systemPrompt) {
  const data = {
    modelURL: "https://api.replicate.com/v1/models/meta/meta-llama-3-70b-instruct/predictions",
    input: {
      prompt: history,
      system_prompt: systemPrompt,
      max_tokens: 150,
      temperature: 0.7,
      top_p: 0.9,
    },
  };

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  };

  const response = await fetch(proxyURL, options);
  const jsonResponse = await response.json();
  return jsonResponse.output.join("").trim();
}

// Utility Functions (Edit/Delete/Add Tabs)

// Edit Tab
function editTab(tabId) {
  const tab = tabs.find(t => t.id === tabId);
  if (!tab) return;

  // Populate the dialog fields with the tab's current values
  document.getElementById('newTabTitle').value = tab.title;
  document.getElementById('newTabSystemPrompt').value = tab.systemPrompt;

  // Open the dialog
  document.getElementById('newTabDialog').style.display = 'block';

  // Update the save button to apply changes
  const saveTabButton = document.getElementById('saveTabButton');
  saveTabButton.onclick = function () {
    tab.title = document.getElementById('newTabTitle').value.trim();
    tab.systemPrompt = document.getElementById('newTabSystemPrompt').value.trim();

    // Close the dialog and re-render tabs
    closeNewTabDialog();
    renderTabs();
  };
}


// Delete Tab
function deleteTab(tabId) {
  tabs = tabs.filter(tab => tab.id !== tabId);
  if (activeTab === tabId && tabs.length > 0) {
    activeTab = tabs[0].id;
  } else if (tabs.length === 0) {
    activeTab = null;
  }
  renderTabs();
}

// Open Dialog for New Tab
// function openNewTabDialog() {
//   document.getElementById('newTabDialog').style.display = 'block';
// }
function openNewTabDialog() {
  document.getElementById('newTabDialog').style.display = 'block';

  // Clear the fields for adding a new tab
  document.getElementById('newTabTitle').value = '';
  document.getElementById('newTabSystemPrompt').value = '';

  // Set the save button to add a new tab
  const saveTabButton = document.getElementById('saveTabButton');
  saveTabButton.onclick = addNewTab; // Ensure it points to the add function
}


// Close Dialog
function closeNewTabDialog() {
  document.getElementById('newTabDialog').style.display = 'none';
}

// Add New Tab
// function addNewTab() {
//   const title = document.getElementById('newTabTitle').value.trim();
//   const systemPrompt = document.getElementById('newTabSystemPrompt').value.trim();
//   if (title && systemPrompt) {
//     tabs.push({ id: Date.now().toString(), title, content: '', systemPrompt, conversationHistory: [] });
//     setActiveTab(tabs[tabs.length - 1].id);
//     closeNewTabDialog();
//     renderTabs();
//   }
// }
function addNewTab() {
  const title = document.getElementById('newTabTitle').value.trim();
  const systemPrompt = document.getElementById('newTabSystemPrompt').value.trim();

  if (title && systemPrompt) {
    // Add the new tab to the tabs array
    tabs.push({
      id: Date.now().toString(), // Unique ID
      title: title,
      content: '',
      systemPrompt: systemPrompt,
      conversationHistory: []
    });

    // Set the new tab as active
    setActiveTab(tabs[tabs.length - 1].id);

    // Close the dialog
    closeNewTabDialog();

    // Re-render tabs to reflect the changes
    renderTabs();
  }
}
window.onload = setup;
