var API = "http://localhost:/api";
var token = localStorage.getItem("token");


if (token) {
    abrirDashboard();
}

async function login() {
    var emailInput = document.getElementById("email").value;
    var senhaInput = document.getElementById("senha").value;

    var res = await fetch(API + "/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput, senha: senhaInput })
    });

    if (res.ok) {
        var data = await res.json();
        token = data.token;
        localStorage.setItem("token", token);
        localStorage.setItem("user", data.nome || "Usuário");
        abrirDashboard();
    } else {
        alert("Email ou senha incorretos!");
    }
}

function logout() {
    localStorage.clear();
    location.reload();
}

function abrirDashboard() {
    document.getElementById("login-box").style.display = "none";
    document.getElementById("main-box").style.display = "block";
    document.getElementById("user-nome").innerText = localStorage.getItem("user");
    
    carregarPersonals();
    carregarTreinos();
}

function verAba(nomeAba) {
    document.getElementById("aba-personals").style.display = "none";
    document.getElementById("aba-alunos").style.display = "none";
    document.getElementById("aba-treinos").style.display = "none";

    document.getElementById("aba-" + nomeAba).style.display = "block";
}


async function carregarPersonals() {
    var termo = document.getElementById("busca-p").value;
    var res = await fetch(API + "/personals?busca=" + termo, {
        headers: { "Authorization": "Bearer " + token }
    });
    var lista = await res.json();
    
    var tbody = document.getElementById("tb-personals");
    var select = document.getElementById("select-personal");
    
    tbody.innerHTML = "";
    select.innerHTML = '<option value="">Selecione o Personal</option>';

    for (var i = 0; i < lista.length; i++) {
        var p = lista[i];
        
       
        tbody.innerHTML += "<tr>" +
            "<td>" + p.id + "</td>" +
            "<td>" + p.nome + "</td>" +
            "<td><button onclick=\"editarPersonal(" + p.id + ", '" + p.nome + "')\">Editar</button></td>" +
        "</tr>";

      
        select.innerHTML += "<option value='" + p.id + "'>" + p.nome + "</option>";
    }
}

async function editarPersonal(id, nomeAtual) {
    var novoNome = prompt("Novo nome para o personal:", nomeAtual);
    if (!novoNome) return;

    await fetch(API + "/personals/" + id, {
        method: "PUT",
        headers: { 
            "Content-Type": "application/json", 
            "Authorization": "Bearer " + token 
        },
        body: JSON.stringify({ id: id, nome: novoNome })
    });

    carregarPersonals();
}


async function salvarAluno() {
    var nome = document.getElementById("aluno-nome").value;
    var personalId = document.getElementById("select-personal").value;

    if (!nome || !personalId) {
        alert("Preencha o nome e selecione o Personal!");
        return;
    }

    await fetch(API + "/alunos", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json", 
            "Authorization": "Bearer " + token 
        },
        body: JSON.stringify({ nome: nome, personalId: personalId })
    });

    alert("Aluno cadastrado!");
    document.getElementById("aluno-nome").value = "";
}


async function carregarTreinos() {
    var res = await fetch(API + "/agendamentos", {
        headers: { "Authorization": "Bearer " + token }
    });
    var lista = await res.json();

    
    lista.sort(function(a, b) {
        return new Date(a.data) - new Date(b.data);
    });

    var tbody = document.getElementById("tb-treinos");
    tbody.innerHTML = "";

    for (var i = 0; i < lista.length; i++) {
        var t = lista[i];
        var alunoNome = t.aluno ? t.aluno.nome : "-";
        var personalNome = t.personal ? t.personal.nome : "-";

        tbody.innerHTML += "<tr>" +
            "<td>" + new Date(t.data).toLocaleString() + "</td>" +
            "<td>" + alunoNome + "</td>" +
            "<td>" + personalNome + "</td>" +
            "<td><button onclick='editarData(" + t.id + ")'>Alterar Data</button></td>" +
        "</tr>";
    }
}

async function editarData(id) {
    var novaData = prompt("Digite a nova data (Formato: YYYY-MM-DDTHH:mm):");
    if (!novaData) return;

    await fetch(API + "/agendamentos/" + id, {
        method: "PUT",
        headers: { 
            "Content-Type": "application/json", 
            "Authorization": "Bearer " + token 
        },
        body: JSON.stringify({ id: id, data: novaData })
    });

    carregarTreinos();
}