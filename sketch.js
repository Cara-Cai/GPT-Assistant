let tabs = [
  { 
    id: 'email', 
    title: 'Email Rephrase', 
    content: '', 
    systemPrompt: 'You are an email rephrasing assistant. Constrain the output to max_token = 1024', 
    conversationHistory: [] 
  },
  { 
    id: 'thesis', 
    title: 'Thesis Brainstorm', 
    content: '', 
    systemPrompt: 'You are a thesis brainstorming assistant.Constrain the output to max_token = 1024', 
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
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.5 7.5L5.92819 14.0718C5.71566 14.2843 5.60939 14.3906 5.53953 14.5212C5.46966 14.6517 5.44019 14.7991 5.38124 15.0938L4.64709 18.7646C4.58057 19.0972 4.5473 19.2635 4.64191 19.3581C4.73652 19.4527 4.90283 19.4194 5.23544 19.3529L8.90621 18.6188C9.20093 18.5598 9.3483 18.5303 9.47885 18.4605C9.60939 18.3906 9.71566 18.2843 9.92819 18.0718L16.5 11.5L12.5 7.5Z" fill="#7E869E" fill-opacity="0.25"/>
<path d="M5.95396 19.38L5.95397 19.38L5.9801 19.3734L5.98012 19.3734L8.60809 18.7164C8.62428 18.7124 8.64043 18.7084 8.65654 18.7044C8.87531 18.65 9.08562 18.5978 9.27707 18.4894C9.46852 18.381 9.62153 18.2275 9.7807 18.0679C9.79242 18.0561 9.80418 18.0444 9.81598 18.0325L17.0101 10.8385L17.0101 10.8385L17.0369 10.8117C17.3472 10.5014 17.6215 10.2272 17.8128 9.97638C18.0202 9.70457 18.1858 9.39104 18.1858 9C18.1858 8.60896 18.0202 8.29543 17.8128 8.02361C17.6215 7.77285 17.3472 7.49863 17.0369 7.18835L17.01 7.16152L16.8385 6.98995L16.8117 6.96314C16.5014 6.6528 16.2272 6.37853 15.9764 6.1872C15.7046 5.97981 15.391 5.81421 15 5.81421C14.609 5.81421 14.2954 5.97981 14.0236 6.1872C13.7729 6.37853 13.4986 6.65278 13.1884 6.96311L13.1615 6.98995L5.96745 14.184C5.95565 14.1958 5.94386 14.2076 5.93211 14.2193C5.77249 14.3785 5.61904 14.5315 5.51064 14.7229C5.40225 14.9144 5.34999 15.1247 5.29562 15.3435C5.29162 15.3596 5.28761 15.3757 5.28356 15.3919L4.62003 18.046C4.61762 18.0557 4.61518 18.0654 4.61272 18.0752C4.57411 18.2293 4.53044 18.4035 4.51593 18.5518C4.49978 18.7169 4.50127 19.0162 4.74255 19.2574C4.98383 19.4987 5.28307 19.5002 5.44819 19.4841C5.59646 19.4696 5.77072 19.4259 5.92479 19.3873C5.9346 19.3848 5.94433 19.3824 5.95396 19.38Z" stroke="#33363F" stroke-width="1.2"/>
<path d="M12.5 7.5L16.5 11.5" stroke="#33363F" stroke-width="1.2"/>
</svg>
        </button>
        <button onclick="deleteTab('${tab.id}')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M18 6L6 18" stroke="#33363F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M6 6L18 18" stroke="#33363F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>



        </button>
      </div>
    </div>
  `
    )
    .join('') + `<button class="add-tab-button" onclick="openNewTabDialog()"> + New </button>`;

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
