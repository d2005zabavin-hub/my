window.addEventListener("load", () => {
    const bg = document.querySelector(".background");
    if (bg) {
        bg.style.opacity = "1";
        document.body.classList.add("loaded");

        // Анимация фона
        let angleX = 0;
        let angleY = 0;
        function animateBackground() {
            angleX += 0.0005;
            angleY += 0.0007;
            const offsetX = Math.sin(angleX) * 15;
            const offsetY = Math.sin(angleY) * 15;
            bg.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(1.05)`;
            requestAnimationFrame(animateBackground);
        }
        animateBackground();
    }

    // Инициализация страниц
    if (document.querySelector(".gallery")) {
        initMoments();
    }
    if (document.querySelector(".plans-section")) {
        initPlans();
    }
    if (document.querySelector(".dreams-section")) {
        initDreams();
    }
});

// -------------------- Моменты --------------------
function initMoments() {
    const gallery = document.querySelector(".gallery");
    const addBtn = document.getElementById("addMomentBtn");
    const form = document.getElementById("addMomentForm");
    const emptyMessage = document.getElementById("emptyMessage");

    // Показ/скрытие формы
    addBtn.addEventListener("click", () => {
        form.style.display = form.style.display === "none" ? "block" : "none";
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const fileInput = document.getElementById("momentPhoto");
        const captionInput = document.getElementById("momentCaption");
        const file = fileInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            const imgSrc = event.target.result;
            const caption = captionInput.value;
            const id = Date.now();

            const newMoment = { id, img: imgSrc, caption };
            const moments = JSON.parse(localStorage.getItem("moments")) || [];
            moments.push(newMoment);
            localStorage.setItem("moments", JSON.stringify(moments));

            addMomentToDOM(newMoment, gallery);
            attachFigureEvents();
            updateEmptyMessage(emptyMessage);

            fileInput.value = "";
            captionInput.value = "";
            form.style.display = "none";
        };
        reader.readAsDataURL(file);
    });

    // Загрузка из localStorage
    const moments = JSON.parse(localStorage.getItem("moments")) || [];
    moments.forEach(moment => addMomentToDOM(moment, gallery));
    attachFigureEvents();
    updateEmptyMessage(emptyMessage);
}

function addMomentToDOM(moment, gallery) {
    const figure = document.createElement("figure");
    figure.dataset.id = moment.id;
    figure.classList.add("fade-in");

    const img = document.createElement("img");
    img.src = moment.img;
    img.alt = moment.caption;

    const figcaption = document.createElement("figcaption");
    figcaption.textContent = moment.caption;

    figure.appendChild(img);
    figure.appendChild(figcaption);
    gallery.appendChild(figure);
}

function updateEmptyMessage(emptyMessage) {
    if (!emptyMessage) return;
    const moments = JSON.parse(localStorage.getItem("moments")) || [];
    emptyMessage.style.display = moments.length === 0 ? "block" : "none";
}

function createContextMenu(figure) {
    const oldMenu = document.querySelector(".context-menu");
    if (oldMenu) oldMenu.remove();

    const menu = document.createElement("div");
    menu.classList.add("context-menu");
    menu.style.position = "absolute";
    menu.style.background = "rgba(0,0,0,0.9)";
    menu.style.color = "#fff";
    menu.style.padding = "8px";
    menu.style.borderRadius = "6px";
    menu.style.top = `${figure.getBoundingClientRect().top + window.scrollY}px`;
    menu.style.left = `${figure.getBoundingClientRect().left + window.scrollX}px`;
    menu.style.zIndex = "10";

    const editBtn = document.createElement("button");
    editBtn.textContent = "Изменить подпись";
    editBtn.style.display = "block";
    editBtn.style.marginBottom = "5px";
    editBtn.onclick = () => {
        const newCaption = prompt("Введите новую подпись:", figure.querySelector("figcaption").textContent);
        if (newCaption) {
            figure.querySelector("figcaption").textContent = newCaption;
            const id = figure.dataset.id;
            const moments = JSON.parse(localStorage.getItem("moments")) || [];
            const idx = moments.findIndex(m => m.id == id);
            if (idx !== -1) {
                moments[idx].caption = newCaption;
                localStorage.setItem("moments", JSON.stringify(moments));
            }
        }
        menu.remove();
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Удалить момент";
    deleteBtn.style.display = "block";
    deleteBtn.onclick = () => {
        if (confirm("Удалить этот момент?")) {
            const id = figure.dataset.id;
            figure.remove();
            let moments = JSON.parse(localStorage.getItem("moments")) || [];
            moments = moments.filter(m => m.id != id);
            localStorage.setItem("moments", JSON.stringify(moments));
        }
        menu.remove();
    };

    menu.appendChild(editBtn);
    menu.appendChild(deleteBtn);
    document.body.appendChild(menu);

    document.addEventListener("click", function hideMenu(e) {
        if (!menu.contains(e.target)) {
            menu.remove();
            document.removeEventListener("click", hideMenu);
        }
    });
}

function attachFigureEvents() {
    const figures = document.querySelectorAll(".gallery figure");
    figures.forEach(fig => {
        fig.onclick = (e) => {
            e.stopPropagation();
            createContextMenu(fig);
        };
    });
}

// -------------------- Наши планы --------------------
function initPlans() {
    const plansSection = document.querySelector(".plans-section");
    const addPlanBtn = document.createElement("button");
    addPlanBtn.id = "addPlanBtn";
    addPlanBtn.textContent = "Добавить план";
    plansSection.prepend(addPlanBtn);

    const plansContainer = document.createElement("div");
    plansContainer.classList.add("plans-container");
    plansSection.appendChild(plansContainer);

    const addPlanForm = document.createElement("form");
    addPlanForm.id = "addPlanForm";
    addPlanForm.innerHTML = `
        <input type="text" id="planText" placeholder="Введите план..." required>
        <button type="submit">Сохранить</button>
    `;
    plansSection.appendChild(addPlanForm);
    addPlanForm.style.display = "none";

    addPlanBtn.addEventListener("click", () => {
        addPlanForm.style.display = addPlanForm.style.display === "none" ? "block" : "none";
    });

    addPlanForm.addEventListener("submit", e => {
        e.preventDefault();
        const input = document.getElementById("planText");
        const text = input.value.trim();
        if (!text) return;

        const id = Date.now();
        const plan = { id, text };
        addPlanToDOM(plan, plansContainer);

        const plans = JSON.parse(localStorage.getItem("plans")) || [];
        plans.push(plan);
        localStorage.setItem("plans", JSON.stringify(plans));

        input.value = "";
        addPlanForm.style.display = "none";
    });

    const savedPlans = JSON.parse(localStorage.getItem("plans")) || [];
    savedPlans.forEach(plan => addPlanToDOM(plan, plansContainer));
}

function addPlanToDOM(plan, container) {
    const planDiv = document.createElement("div");
    planDiv.classList.add("plan-note", "fade-in");
    planDiv.dataset.id = plan.id;

    const textP = document.createElement("p");
    textP.textContent = plan.text;

    planDiv.appendChild(textP);
    container.appendChild(planDiv);

    planDiv.addEventListener("click", e => {
        e.stopPropagation();
        createPlanContextMenu(planDiv);
    });
}

function createPlanContextMenu(planDiv) {
    const oldMenu = document.querySelector(".plan-context-menu");
    if (oldMenu) oldMenu.remove();

    const menu = document.createElement("div");
    menu.classList.add("plan-context-menu");
    menu.style.position = "absolute";
    menu.style.background = "rgba(0,0,0,0.9)";
    menu.style.color = "#fff";
    menu.style.padding = "8px";
    menu.style.borderRadius = "6px";
    menu.style.top = `${planDiv.getBoundingClientRect().top + window.scrollY}px`;
    menu.style.left = `${planDiv.getBoundingClientRect().left + window.scrollX}px`;
    menu.style.zIndex = "10";

    const editBtn = document.createElement("button");
    editBtn.textContent = "Изменить план";
    editBtn.style.display = "block";
    editBtn.style.marginBottom = "5px";
    editBtn.onclick = () => {
        const newText = prompt("Введите новый текст плана:", planDiv.querySelector("p").textContent);
        if (newText) {
            planDiv.querySelector("p").textContent = newText;
            updatePlanInStorage(planDiv.dataset.id, newText);
        }
        menu.remove();
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Удалить план";
    deleteBtn.style.display = "block";
    deleteBtn.onclick = () => {
        if (confirm("Вы уверены, что хотите удалить этот план?")) {
            const id = planDiv.dataset.id;
            planDiv.remove();
            deletePlanFromStorage(id);
        }
        menu.remove();
    };

    menu.appendChild(editBtn);
    menu.appendChild(deleteBtn);
    document.body.appendChild(menu);

    document.addEventListener("click", function hideMenu(e) {
        if (!menu.contains(e.target)) {
            menu.remove();
            document.removeEventListener("click", hideMenu);
        }
    });
}

function updatePlanInStorage(id, newText) {
    const plans = JSON.parse(localStorage.getItem("plans")) || [];
    const idx = plans.findIndex(p => p.id == id);
    if (idx !== -1) {
        plans[idx].text = newText;
        localStorage.setItem("plans", JSON.stringify(plans));
    }
}

function deletePlanFromStorage(id) {
    let plans = JSON.parse(localStorage.getItem("plans")) || [];
    plans = plans.filter(p => p.id != id);
    localStorage.setItem("plans", JSON.stringify(plans));
}

// -------------------- Мечты --------------------
function initDreams() {
    const dreamsSection = document.querySelector(".dreams-section");
    const addBtn = document.getElementById("addDreamBtn");
    const form = document.getElementById("addDreamForm");
    const gallery = document.querySelector(".dreams-gallery");
    const emptyMessage = document.getElementById("emptyMessage");

    // Показ/скрытие формы
    addBtn.addEventListener("click", () => {
        form.style.display = form.style.display === "none" ? "block" : "none";
    });

    // Добавление мечты
    form.addEventListener("submit", e => {
        e.preventDefault();
        const textInput = document.getElementById("dreamText");
        const fileInput = document.getElementById("dreamPhoto");
        const text = textInput.value.trim();
        const file = fileInput.files[0];
        if (!text && !file) return;

        const id = Date.now();
        const dream = { id, text, img: null };

        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                dream.img = event.target.result;
                saveDream(dream, gallery);
            };
            reader.readAsDataURL(file);
        } else {
            saveDream(dream, gallery);
        }

        textInput.value = "";
        fileInput.value = "";
        form.style.display = "none";
    });

    // Загрузка мечт
    const dreams = JSON.parse(localStorage.getItem("dreams")) || [];
    dreams.forEach(d => addDreamToDOM(d, gallery));
    updateEmptyMessageDreams(emptyMessage);
}

function saveDream(dream, gallery) {
    const dreams = JSON.parse(localStorage.getItem("dreams")) || [];
    dreams.push(dream);
    localStorage.setItem("dreams", JSON.stringify(dreams));
    addDreamToDOM(dream, gallery);
    updateEmptyMessageDreams(document.getElementById("emptyMessage"));
}

function addDreamToDOM(dream, gallery) {
    const div = document.createElement("div");
    div.classList.add("dream-note", "fade-in");
    div.dataset.id = dream.id;

    if (dream.img) {
        const img = document.createElement("img");
        img.src = dream.img;
        img.alt = dream.text || "Мечта";
        div.appendChild(img);
    }

    if (dream.text) {
        const p = document.createElement("p");
        p.textContent = dream.text;
        div.appendChild(p);
    }

    gallery.appendChild(div);

    div.addEventListener("click", e => {
        e.stopPropagation();
        createDreamContextMenu(div);
    });
}

function createDreamContextMenu(div) {
    const oldMenu = document.querySelector(".dream-context-menu");
    if (oldMenu) oldMenu.remove();

    const menu = document.createElement("div");
    menu.classList.add("dream-context-menu");
    menu.style.position = "absolute";
    menu.style.background = "rgba(0,0,0,0.9)";
    menu.style.color = "#fff";
    menu.style.padding = "8px";
    menu.style.borderRadius = "6px";
    menu.style.top = `${div.getBoundingClientRect().top + window.scrollY}px`;
    menu.style.left = `${div.getBoundingClientRect().left + window.scrollX}px`;
    menu.style.zIndex = "10";

    const editBtn = document.createElement("button");
    editBtn.textContent = "Изменить мечту";
    editBtn.style.display = "block";
    editBtn.style.marginBottom = "5px";
    editBtn.onclick = () => {
        const newText = prompt("Введите новый текст мечты:", div.querySelector("p") ? div.querySelector("p").textContent : "");
        if (newText !== null) {
            if (!div.querySelector("p")) {
                const p = document.createElement("p");
                p.textContent = newText;
                div.appendChild(p);
            } else {
                div.querySelector("p").textContent = newText;
            }
            updateDreamInStorage(div.dataset.id, newText);
        }
        menu.remove();
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Удалить мечту";
    deleteBtn.style.display = "block";
    deleteBtn.onclick = () => {
        if (confirm("Удалить эту мечту?")) {
            const id = div.dataset.id;
            div.remove();
            deleteDreamFromStorage(id);
        }
        menu.remove();
    };

    menu.appendChild(editBtn);
    menu.appendChild(deleteBtn);
    document.body.appendChild(menu);

    document.addEventListener("click", function hideMenu(e) {
        if (!menu.contains(e.target)) {
            menu.remove();
            document.removeEventListener("click", hideMenu);
        }
    });
}

function updateDreamInStorage(id, newText) {
    const dreams = JSON.parse(localStorage.getItem("dreams")) || [];
    const idx = dreams.findIndex(d => d.id == id);
    if (idx !== -1) {
        dreams[idx].text = newText;
        localStorage.setItem("dreams", JSON.stringify(dreams));
    }
}

function deleteDreamFromStorage(id) {
    let dreams = JSON.parse(localStorage.getItem("dreams")) || [];
    dreams = dreams.filter(d => d.id != id);
    localStorage.setItem("dreams", JSON.stringify(dreams));
}

function updateEmptyMessageDreams(emptyMessage) {
    if (!emptyMessage) return;
    const dreams = JSON.parse(localStorage.getItem("dreams")) || [];
    emptyMessage.style.display = dreams.length === 0 ? "block" : "none";
}
