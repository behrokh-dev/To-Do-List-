const dosList = document.getElementById("dos"); 

function createTaskLi(text, done, marked, category) {
  const li = document.createElement("li");
  li.className = "lii";
  li.dataset.category = category;

  if (done) {
    li.classList.add("completed");
  }

  if (marked) {
    li.classList.add("marked");
  }

  li.innerHTML = `
      <input type="checkbox" class="checked" ${done ? "checked" : ""}/>
        <span class="cat-dot cat-${category}"></span>
        <label>${text}</label>
          <div class="actions">
            <button data-action="edit"><i class="ri-pencil-ai-line"></i></button>
            <button data-action="delete"><i class="ri-close-circle-line"></i></button>
            <button data-action="mark"><i class="ri-bookmark-line"></i></button>
          </div>`;
  return li;
}

function saveTasks() {
  const tasks = [];
  document.querySelectorAll(".lii").forEach((val) => {
    const label = val.querySelector("label");
    const checkbox = val.querySelector(".checked");
    tasks.push({
      text: label.textContent.trim(),
      done: checkbox.checked,
      marked: val.classList.contains("marked"),
      category: val.dataset.category,
    });
  });
  localStorage.setItem("todos", JSON.stringify(tasks));
}

function loadTasks() {
  const saved = localStorage.getItem("todos");
  if (!saved) return; 

  const tasks = JSON.parse(saved);
  dosList.innerHTML = ""; 

  tasks.forEach((task) => {
    const category = task.category || "personal"; 
    const li = createTaskLi(task.text, task.done, task.marked, category);
    dosList.appendChild(li);
  });
}


function normalizeExistingTasks() {
  document.querySelectorAll(".lii").forEach((val) => {
    if (!val.dataset.category) {
      val.dataset.category = "personal";
    }
    if (!val.querySelector(".cat-dot")) {
    
      const dot = document.createElement("span");
      dot.className = `cat-dot cat-${val.dataset.category}`;
      const label = val.querySelector("label");
      val.insertBefore(dot, label); 
    }
  });
}

///////////////////////////////
let isDragging = false;
let startY = 0;
let scrollTopStart = 0;

dosList.addEventListener("mousedown", (e) => {
  if (e.target.closest(".lii")) return;

  const rect = dosList.getBoundingClientRect();
  const isOnScrollbar = e.clientX - rect.left >= dosList.clientWidth;
  if (isOnScrollbar) return;

  isDragging = true;
  startY = e.clientY;
  scrollTopStart = dosList.scrollTop;
  dosList.classList.add("cursor-grabbing");
});

window.addEventListener("mouseup", () => {
  isDragging = false;
  dosList.classList.remove("cursor-grabbing");
});

window.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  const deltaY = e.clientY - startY;
  dosList.scrollTop = scrollTopStart - deltaY;
});
//////////////////////////////
/////////////////////////////

const inp = document.querySelector("input[type=text]");
const searchInput = document.getElementById("search-todo");
const taskCount = document.getElementById("task-count");
const addbtn = document.querySelector(".addbtn");
const savebtn = document.querySelector(".savebtn");
const categorySelect = document.getElementById("category-select");
const status = document.getElementById("status");
let currentEditingLi = null;

addbtn.addEventListener("click", () => {
  let task = inp.value;
  if (task === "") {
    alert("Please enter a task!");
  } else {
    const category = categorySelect.value;
    const newLi = document.createElement("li");
    newLi.className = "lii";
    newLi.dataset.status = "active"; 
    newLi.dataset.category = category; 
    newLi.innerHTML = `
        <input type="checkbox" class="checked"/>
          <span class="cat-dot cat-${category}"></span>
          <label>${task}</label>
            <div class="actions">
              <button data-action="edit"><i class="ri-pencil-ai-line"></i></button>
              <button data-action="delete"><i class="ri-close-circle-line"></i></button>
              <button data-action="mark"><i class="ri-bookmark-line"></i></button>
            </div>`;
    dosList.prepend(newLi);
    saveTasks();
    updateCounter();
    inp.value = null; 
    inp.focus();
  }
});

dosList.addEventListener("click", (e) => {
 
  const btn = e.target.closest("button"); 
  if (!btn) return;

  const li = btn.closest("li"); 

  const action = btn.dataset.action; 

  if (action === "edit") {
    myEdit(li);
  } else if (action === "delete") {
    myDelete(li);
  } else if (action === "mark") {
    myMark(li);
  }
});

dosList.addEventListener("change", (e) => {
 
  if (e.target.classList.contains("checked")) {
  
    const li = e.target.closest(".lii"); 

    li.classList.toggle("completed", e.target.checked); 
    saveTasks();
    updateCounter();
  }
});

function myEdit(litag) {
  if (currentEditingLi === litag) {
    cancelEdit(); 
    return;
  }

  cancelEdit(); 
  currentEditingLi = litag;
  currentEditingLi.classList.add("editing");
  inp.value = litag.querySelector("label").textContent.trim(); 
  categorySelect.value = litag.dataset.category;

  addbtn.style.display = "none";
  savebtn.style.display = "flex";
}

function cancelEdit() {
  if (!currentEditingLi) return; 
  currentEditingLi.classList.remove("editing"); 
  currentEditingLi = null; 
  inp.value = "";
  addbtn.style.display = "flex";
  savebtn.style.display = "none";
}

function myDelete(litag) {
  if (confirm("Are you sure you want to delete this task?")) {
    litag.classList.add("del");
    setTimeout(() => {
      litag.remove();
      saveTasks();
      updateCounter();
    }, 700);
  }
}

function myMark(litag) {
  litag.classList.toggle("marked");
  saveTasks();
  filterTasks(status.value);
}

savebtn.addEventListener("click", () => {
  addbtn.style.display = "flex";
  savebtn.style.display = "none";
  if (currentEditingLi) {
   
    const label = currentEditingLi.querySelector("label"); 
    label.textContent = inp.value;

    const newCategory = categorySelect.value; 
    currentEditingLi.dataset.category = newCategory; 

    const dot = currentEditingLi.querySelector(".cat-dot"); 
    dot.className = `cat-dot cat-${newCategory}`; 
    currentEditingLi.classList.remove("editing"); 
    saveTasks();
  }

  inp.value = "";
  currentEditingLi = null;
});

status.addEventListener("change", (e) => {
  filterTasks(status.value);
});

function filterTasks(filter) {
  document.querySelectorAll(".lii").forEach((li) => {
    const isDone = li.querySelector(".checked").checked; 
    const isMarked = li.classList.contains("marked"); 

    const show =                  
      filter === "all" ||
      (filter === "done" && isDone) ||
      (filter === "active" && !isDone) ||
      (filter === "marked" && isMarked);

    if (show) {
      li.style.display = "";                 
    } else {
      li.style.display = "none";             
    }
  });
}

inp.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    addbtn.click();
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    cancelEdit();
  }
});

searchInput.addEventListener("input", () => {
  const value = searchInput.value.toLowerCase();               

  document.querySelectorAll(".lii").forEach((li) => {
    const text = li.querySelector("label").textContent.toLowerCase();

    if (text.includes(value)) {                     
      li.style.display = "";                       
    } else {
      li.style.display = "none";                  
    }
  });
});

function updateCounter() {
  const tasks = document.querySelectorAll(".lii");

  if (tasks.length === 0) {
    taskCount.textContent = "No tasks yet 🌱";
    return;
  }

  const completed = [...tasks].filter((li) => li.querySelector(".checked").checked,).length;

  const active = tasks.length - completed;

  taskCount.textContent = `${tasks.length} Tasks | ${completed} Completed | ${active} Active`;
}
///////////////drag & drop////////////
let draggedLi = null;
let placeholder = null;
let ghostEl = null;
let offsetY = 0;
let dragStartX = 0;
let dragStartY = 0;
let dragStarted = false;

dosList.addEventListener("mousedown", (e) => {
  const li = e.target.closest(".lii");
  if (!li) return;
  if (e.target.closest("button") || e.target.closest("input")) return;

  dragStartX = e.clientX;
  dragStartY = e.clientY;
  dragStarted = false;
  draggedLi = li;

  document.addEventListener("mousemove", onPossibleDragStart);
  document.addEventListener("mouseup", cancelDragSetup);
});

function onPossibleDragStart(e) {
  const movedEnough =
    Math.abs(e.clientY - dragStartY) > 5 ||
    Math.abs(e.clientX - dragStartX) > 5;
  if (!movedEnough) return;

  document.removeEventListener("mousemove", onPossibleDragStart);
  document.removeEventListener("mouseup", cancelDragSetup);

  dragStarted = true;
  beginRealDrag(e);
}
function cancelDragSetup() {
  document.removeEventListener("mousemove", onPossibleDragStart);
  document.removeEventListener("mouseup", cancelDragSetup);
  draggedLi = null;
}

function beginRealDrag(e) {
  const rect = draggedLi.getBoundingClientRect();
  offsetY = e.clientY - rect.top;

  ghostEl = draggedLi.cloneNode(true);
  ghostEl.classList.add("lii-ghost");
  ghostEl.style.width = rect.width + "px";
  ghostEl.style.left = rect.left + "px";
  ghostEl.style.top = rect.top + "px";
  document.body.appendChild(ghostEl);

  placeholder = document.createElement("li");
  placeholder.className = "lii-placeholder";
  placeholder.style.height = rect.height + "px";
  draggedLi.parentNode.insertBefore(placeholder, draggedLi);

  draggedLi.classList.add("lii-source-hidden");

  document.addEventListener("mousemove", onDragMove);
  document.addEventListener("mouseup", onDragEnd);
}

function onDragMove(e) {
  if (!ghostEl) return;
  ghostEl.style.top = e.clientY - offsetY + "px";

  const afterElement = getDragAfterElement(dosList, e.clientY);
  if (afterElement === null) {
    dosList.appendChild(placeholder);
  } else {
    dosList.insertBefore(placeholder, afterElement);
  }
}

function onDragEnd() {
  document.removeEventListener("mousemove", onDragMove);
  document.removeEventListener("mouseup", onDragEnd);

  if (placeholder && draggedLi) {
    placeholder.replaceWith(draggedLi);
    draggedLi.classList.remove("lii-source-hidden");
    saveTasks();
  }

  if (ghostEl) ghostEl.remove();
  ghostEl = null;
  placeholder = null;
  draggedLi = null;
  dragStarted = false;
}

function getDragAfterElement(container, y) {
  const items = [...container.querySelectorAll(".lii:not(.lii-source-hidden)")];

  let closest = null;
  let closestOffset = Number.NEGATIVE_INFINITY;

  items.forEach((item) => {
    const box = item.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;

    if (offset < 0 && offset > closestOffset) {
      closestOffset = offset;
      closest = item;
    }
  });

  return closest;
}
//////////////////////////////

loadTasks();
normalizeExistingTasks();
saveTasks();
updateCounter();
