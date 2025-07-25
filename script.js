const asideList = document.getElementById("menu-listas");
const listTitle = document.getElementById("titulo-lista");
const newItemInput = document.getElementById("texto-tarefa");
const addItemButton = document.getElementById("criar-tarefa");
const itemList = document.getElementById("lista-tarefas");
const clearCompletedButton = document.getElementById("remover-finalizados");
const clearAllButton = document.getElementById("apaga-tudo");
const newListButton = document.getElementById("nova-lista");
const postponeListButton = document.getElementById("concluir-depois");
const closeListButton = document.getElementById("concluir-depois");
const clearAllListsButton = document.getElementById("limpar-todas-listas");

const listaArea = document.getElementById("area-lista-trabalho");
const telaInicial = document.getElementById("tela-inicial");

let lists = JSON.parse(localStorage.getItem("lists")) || [];
let currentListIndex = 0;
let isListVisible = lists.length > 0;

function saveToLocalStorage() {
  localStorage.setItem("lists", JSON.stringify(lists));
}

function updateListStatus(index) {
  const list = lists[index];
  const total = list.items.length;
  const concluidos = list.items.filter(item => item.completed).length;

  if (total > 0 && concluidos === total) {
    list.status = "Concluído";
  } else {
    list.status = "Em progresso";
  }
}

function updateAside() {
  asideList.innerHTML = "";
  lists.forEach((list, index) => {
    const li = document.createElement("li");
    li.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center", "list-group-item-action");

    if (index === currentListIndex && isListVisible) {
      li.classList.add("bg-primary", "text-white");
    }

    const span = document.createElement("span");
    span.innerHTML = `<strong>${list.name}</strong> <small class="text-muted">(${list.items.length})</small>`;

    const badge = document.createElement("span");
    badge.classList.add("badge", `bg-${list.status === "Concluído" ? "success" : "secondary"}`);
    badge.textContent = list.status;

    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("btn", "btn-sm", "btn-danger", "ms-2");
    deleteBtn.textContent = "Apagar";
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      showModal({
        title: "Excluir Lista",
        message: `Deseja realmente excluir a lista "${list.name}"?`,
        callback: (confirmed) => {
          if (confirmed) {
            lists.splice(index, 1);
            if (index === currentListIndex) {
              currentListIndex = 0;
              isListVisible = false;
            } else if (index < currentListIndex) {
              currentListIndex--;
            }
            saveToLocalStorage();
            updateUI();
          }
        }
      });
    });

    li.appendChild(span);
    li.appendChild(badge);
    li.appendChild(deleteBtn);

    li.addEventListener("click", () => {
      currentListIndex = index;
      isListVisible = true;
      updateUI();
    });

    asideList.appendChild(li);
  });
}

function updateUI() {
  if (lists.length === 0 || !isListVisible) {
    telaInicial.style.display = "block";
    listaArea.style.display = "none";
    updateAside();
    return;
  }

  telaInicial.style.display = "none";
  listaArea.style.display = "block";

  const currentList = lists[currentListIndex];
  listTitle.textContent = currentList.name;
  itemList.innerHTML = "";

  currentList.items.forEach((item, index) => {
    const li = document.createElement("li");
    li.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
    if (item.completed) {
      li.style.textDecoration = "line-through";
      li.classList.add("text-muted");
    }

    li.addEventListener("click", (e) => {
      if (!e.target.closest("button")) {
        item.completed = !item.completed;
        updateListStatus(currentListIndex);
        saveToLocalStorage();
        updateUI();
      }
    });

    const span = document.createElement("span");
    span.textContent = item.text;

    const editBtn = document.createElement("button");
    editBtn.classList.add("btn", "btn-sm", "btn-outline-primary", "me-1");
    editBtn.textContent = "✎";
    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      showModal({
        title: "Editar Item",
        placeholder: "Novo texto...",
        initialValue: item.text,
        isPrompt: true,
        callback: (newText) => {
          if (newText !== "") {
            item.text = newText;
            saveToLocalStorage();
            updateUI();
          } else {
            showModal({ title: "Erro", message: "O texto do item não pode estar vazio." });
          }
        }
      });
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("btn", "btn-sm", "btn-outline-danger");
    deleteBtn.textContent = "🗑";
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      currentList.items.splice(index, 1);
      updateListStatus(currentListIndex);
      saveToLocalStorage();
      updateUI();
    });

    const btnGroup = document.createElement("div");
    btnGroup.appendChild(editBtn);
    btnGroup.appendChild(deleteBtn);

    li.appendChild(span);
    li.appendChild(btnGroup);
    itemList.appendChild(li);
  });

  updateListStatus(currentListIndex);
  saveToLocalStorage();
  updateAside();
}

// MODAL
function showModal({ title, message = "", placeholder = "", initialValue = "", isPrompt = false, callback }) {
  const modal = new bootstrap.Modal(document.getElementById("customModal"));
  const modalTitle = document.getElementById("customModalLabel");
  const modalInput = document.getElementById("modalInput");
  const modalMessage = document.getElementById("modalMessage");
  const modalConfirm = document.getElementById("modalConfirm");

  modalTitle.textContent = title;
  modalMessage.textContent = message;

  if (isPrompt) {
    modalInput.classList.remove("d-none");
    modalInput.value = initialValue;
    modalInput.placeholder = placeholder;
    setTimeout(() => modalInput.focus(), 300);
  } else {
    modalInput.classList.add("d-none");
    modalInput.value = "";
  }

  const newConfirm = modalConfirm.cloneNode(true);
  modalConfirm.parentNode.replaceChild(newConfirm, modalConfirm);

  newConfirm.addEventListener("click", () => {
    callback(isPrompt ? modalInput.value.trim() : true);
    modal.hide();
  });

  modal.show();
}

// EVENTOS
addItemButton.addEventListener("click", () => {
  const text = newItemInput.value.trim();
  if (text === "") {
    showModal({ title: "Erro", message: "O item não pode estar vazio." });
    return;
  }

  lists[currentListIndex].items.push({ text, completed: false });
  updateListStatus(currentListIndex);
  newItemInput.value = "";
  saveToLocalStorage();
  updateUI();
});

newItemInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addItemButton.click();
});

clearCompletedButton.addEventListener("click", () => {
  lists[currentListIndex].items = lists[currentListIndex].items.filter(item => !item.completed);
  updateListStatus(currentListIndex);
  saveToLocalStorage();
  updateUI();
});

clearAllButton.addEventListener("click", () => {
  showModal({
    title: "Confirmar",
    message: "Deseja apagar todos os itens desta lista?",
    callback: (confirmed) => {
      if (confirmed) {
        lists[currentListIndex].items = [];
        updateListStatus(currentListIndex);
        saveToLocalStorage();
        updateUI();
      }
    }
  });
});

newListButton.addEventListener("click", () => {
  showModal({
    title: "Nova Lista",
    placeholder: "Nome da nova lista",
    isPrompt: true,
    callback: (name) => {
      if (name !== "") {
        lists.push({ name, items: [], status: "Em progresso" });
        currentListIndex = lists.length - 1;
        isListVisible = true;
        saveToLocalStorage();
        updateUI();
      } else {
        showModal({ title: "Erro", message: "O nome da lista não pode estar vazio." });
      }
    }
  });
});

listTitle.addEventListener("blur", () => {
  const newName = listTitle.textContent.trim();
  if (newName !== "") {
    lists[currentListIndex].name = newName;
    saveToLocalStorage();
    updateAside();
  } else {
    showModal({ title: "Erro", message: "O nome da lista não pode estar vazio." });
    listTitle.textContent = lists[currentListIndex].name;
  }
});

postponeListButton.addEventListener("click", () => {
  lists[currentListIndex].status = "Pendente";
  saveToLocalStorage();
  updateUI();
});

closeListButton.addEventListener("click", () => {
  isListVisible = false;
  updateUI();
});

clearAllListsButton.addEventListener("click", () => {
  showModal({
    title: "Limpar Todas as Listas",
    message: "Tem certeza que deseja apagar todas as listas? Isso não pode ser desfeito.",
    callback: (confirmed) => {
      if (confirmed) {
        lists = [];
        currentListIndex = 0;
        isListVisible = false;
        saveToLocalStorage();
        updateUI();
      }
    }
  });
});

// Inicialização
updateUI();
