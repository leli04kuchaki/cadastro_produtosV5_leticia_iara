
//
// FASE 1: Modelagem dos dados
//

class Produto {
    constructor(nome, preco, quantidade) {
        this.nome = nome;
        this.preco = parseFloat(preco);
        this.quantidade = parseInt(quantidade);
    }

    calcularSubtotal() {
        return this.preco * this.quantidade;
    }
}

//
// FASE 2: Gerenciamento de estado
//

const listaDeProdutos = [];

let indiceEdicao = null;
let acaoPendente = null;

const CHAVE_STORAGE = "sistema_estoque_produtos";

//
// FASE 3: Captura dos elementos do DOM
//

const formProduto = document.getElementById("produto-form");
const btnSubmit = formProduto.querySelector("button[type='submit']");
const btnLimparTudo = document.getElementById("limpar-tabela");
const totalEstoqueEl = document.getElementById("total-estoque");
const campoBusca = document.getElementById("campo-busca");

const mensagemErro = document.getElementById("mensagem-erro");
const btnCancelarEdicao = document.getElementById("btn-cancelar-edicao");

const modalConfirmacao = document.getElementById("modal-confirmacao");
const modalTitulo = document.getElementById("modal-titulo");
const modalMensagem = document.getElementById("modal-mensagem");

const btnConfirmarModal = document.getElementById("btn-confirmar-modal");
const btnCancelarModal = document.getElementById("btn-cancelar-modal");

const modalBootstrap = document.getElementById("modal-bootstrap");
const btnBootstrap = document.getElementById("btn-bootstrap");
const btnFecharBootstrap = document.getElementById("btn-fechar-bootstrap");

//
// FASE 4: Persistência com localStorage
//

function salvarNoLocalStorage() {
    localStorage.setItem(
        CHAVE_STORAGE,
        JSON.stringify(listaDeProdutos)
    );
}

function carregarDoLocalStorage() {
    const dadosSalvos = localStorage.getItem(CHAVE_STORAGE);

    if (dadosSalvos) {
        try {
            const produtosObjetos = JSON.parse(dadosSalvos);

            if (!Array.isArray(produtosObjetos)) {
                throw new Error("Formato inválido");
            }

            produtosObjetos.forEach((prod) => {
                const produto = new Produto(
                    prod.nome,
                    prod.preco,
                    prod.quantidade
                );

                listaDeProdutos.push(produto);
            });

        } catch (erro) {
            listaDeProdutos.length = 0;
            localStorage.removeItem(CHAVE_STORAGE);
            exibirMensagem("Não foi possível carregar os produtos salvos.", "erro");
        }
    }
}

//
// FASE 5: Mensagens Inline
//

function exibirMensagem(texto, tipo = "erro") {
    mensagemErro.textContent = texto;

    mensagemErro.className = "mensagem-inline " + tipo;
    mensagemErro.style.display = "block";
}

function limparMensagem() {
    mensagemErro.textContent = "";
    mensagemErro.className = "mensagem-inline";
    mensagemErro.style.display = "none";
}

//
// FASE 6: Controle de edição
//

function prepararEdicao(index) {
    const produto = listaDeProdutos[index];

    if (!produto) return;

    document.getElementById("nome").value = produto.nome;
    document.getElementById("preco").value = produto.preco;
    document.getElementById("quantidade").value = produto.quantidade;

    indiceEdicao = index;

    btnSubmit.textContent = "Salvar Alterações";
    btnSubmit.classList.add("btn-warning");

    btnCancelarEdicao.style.display = "block";

    limparMensagem();

    document.getElementById("nome").focus();

    formProduto.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

function cancelarEdicao() {
    indiceEdicao = null;

    formProduto.reset();

    btnSubmit.textContent = "Adicionar Produto";
    btnSubmit.classList.remove("btn-warning");

    btnCancelarEdicao.style.display = "none";

    limparMensagem();
}

btnCancelarEdicao.addEventListener("click", cancelarEdicao);

//
// FASE 7: Modal de confirmação personalizado
//

function abrirModal(titulo, mensagem, acao) {
    modalTitulo.textContent = titulo;
    modalMensagem.textContent = mensagem;

    acaoPendente = acao;

    modalConfirmacao.classList.add("ativo");
    modalConfirmacao.setAttribute("aria-hidden", "false");

    btnCancelarModal.focus();
}

function fecharModal() {
    modalConfirmacao.classList.remove("ativo");
    modalConfirmacao.setAttribute("aria-hidden", "true");

    acaoPendente = null;
}

btnCancelarModal.addEventListener("click", fecharModal);

btnConfirmarModal.addEventListener("click", function () {
    if (typeof acaoPendente === "function") {
        const acao = acaoPendente;

        fecharModal();

        acao();
    }
});

// Fechar modal clicando fora da janela
modalConfirmacao.addEventListener("click", function (event) {
    if (event.target === modalConfirmacao) {
        fecharModal();
    }
});

//
// FASE 8: Cadastro e edição
//

formProduto.addEventListener("submit", function (event) {
    event.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const preco = parseFloat(document.getElementById("preco").value);
    const quantidade = Number(document.getElementById("quantidade").value);

    // Validação do nome
    if (!nome) {
        exibirMensagem("Por favor, informe o nome do produto.");
        document.getElementById("nome").focus();
        return;
    }

    // Validação do preço
    if (isNaN(preco) || preco <= 0) {
        exibirMensagem("O preço deve ser maior que zero.");
        document.getElementById("preco").focus();
        return;
    }

    // Validação da quantidade
    if (!Number.isInteger(quantidade) || quantidade <= 0) {
        exibirMensagem("A quantidade deve ser um número inteiro maior que zero.");
        document.getElementById("quantidade").focus();
        return;
    }

    const produtoValido = new Produto(nome, preco, quantidade);

    if (indiceEdicao === null) {
        listaDeProdutos.push(produtoValido);

        exibirMensagem("Produto cadastrado com sucesso!", "sucesso");

    } else {
        listaDeProdutos[indiceEdicao] = produtoValido;

        indiceEdicao = null;

        btnSubmit.textContent = "Adicionar Produto";
        btnSubmit.classList.remove("btn-warning");

        btnCancelarEdicao.style.display = "none";

        exibirMensagem("Produto atualizado com sucesso!", "sucesso");
    }

    salvarNoLocalStorage();

    formProduto.reset();

    atualizarInterface();
});

//
// FASE 9: Pesquisa dinâmica
//

campoBusca.addEventListener("input", function () {
    atualizarInterface();
});

//
// FASE 10: Remover produto com modal
//

function removerProduto(index) {
    abrirModal(
        "Excluir produto",
        `Tem certeza que deseja remover "${listaDeProdutos[index].nome}"?`,
        function () {
            listaDeProdutos.splice(index, 1);

            if (indiceEdicao === index) {
                cancelarEdicao();

            } else if (indiceEdicao !== null && indiceEdicao > index) {
                indiceEdicao--;
            }

            salvarNoLocalStorage();

            atualizarInterface();

            exibirMensagem("Produto removido com sucesso!", "sucesso");
        }
    );
}

//
// FASE 11: Limpar tudo com modal
//

btnLimparTudo.addEventListener("click", function () {

    if (listaDeProdutos.length === 0) {
        exibirMensagem("A tabela já está vazia!", "erro");
        return;
    }

    abrirModal(
        "Limpar todo o estoque",
        "Tem certeza que deseja remover todos os produtos? Essa ação não poderá ser desfeita.",
        function () {

            listaDeProdutos.length = 0;

            localStorage.removeItem(CHAVE_STORAGE);

            cancelarEdicao();

            atualizarInterface();

            exibirMensagem("Todos os produtos foram removidos!", "sucesso");
        }
    );
});

//
// FASE 12: Filtragem dinâmica
//

function obterProdutosFiltrados() {
    const termoBusca = campoBusca.value.toLowerCase().trim();

    return listaDeProdutos.filter((produto) => {
        return produto.nome.toLowerCase().includes(termoBusca);
    });
}

//
// FASE 13: Atualização do total
//

function atualizarTotalEstoque() {
    const produtosVisiveis = obterProdutosFiltrados();

    const total = produtosVisiveis.reduce((acc, produto) => {
        return acc + produto.calcularSubtotal();
    }, 0);

    totalEstoqueEl.textContent =
        `Total em Estoque: R$ ${total.toFixed(2).replace(".", ",")}`;
}

//
// FASE 14: Renderização da tabela
//

function renderizarTabela() {
    const tabelaBody = document.querySelector("#tabela-produtos tbody");

    tabelaBody.innerHTML = "";

    const produtosVisiveis = obterProdutosFiltrados();

    if (produtosVisiveis.length === 0) {
        const linha = document.createElement("tr");
        const celula = document.createElement("td");

        celula.colSpan = 5;
        celula.className = "mensagem-vazia";
        celula.textContent = "Nenhum produto encontrado!";

        linha.appendChild(celula);
        tabelaBody.appendChild(linha);

        return;
    }

    produtosVisiveis.forEach((produto) => {

        const index = listaDeProdutos.indexOf(produto);

        const linha = document.createElement("tr");

        const celulaNome = document.createElement("td");
        const celulaPreco = document.createElement("td");
        const celulaQuantidade = document.createElement("td");
        const celulaSubtotal = document.createElement("td");
        const celulaAcoes = document.createElement("td");

        celulaNome.textContent = produto.nome;

        celulaPreco.textContent =
            `R$ ${produto.preco.toFixed(2).replace(".", ",")}`;

        celulaQuantidade.textContent = produto.quantidade;

        celulaSubtotal.textContent =
            `R$ ${produto.calcularSubtotal().toFixed(2).replace(".", ",")}`;

        const btnEditar = document.createElement("button");

        btnEditar.textContent = "Editar";
        btnEditar.className = "btn-editar";

        btnEditar.addEventListener("click", function () {
            prepararEdicao(index);
        });

        const btnRemover = document.createElement("button");

        btnRemover.textContent = "Remover";
        btnRemover.className = "btn-remover";

        btnRemover.addEventListener("click", function () {
            removerProduto(index);
        });

        celulaAcoes.appendChild(btnEditar);
        celulaAcoes.appendChild(btnRemover);

        linha.appendChild(celulaNome);
        linha.appendChild(celulaPreco);
        linha.appendChild(celulaQuantidade);
        linha.appendChild(celulaSubtotal);
        linha.appendChild(celulaAcoes);

        tabelaBody.appendChild(linha);
    });
}

//
// FASE 15: Atualização geral
//

function atualizarInterface() {
    renderizarTabela();
    atualizarTotalEstoque();
}

//
// FASE 16: Modal do conceito Bootstrap
//

function abrirModalBootstrap() {
    modalBootstrap.classList.add("ativo");
    modalBootstrap.setAttribute("aria-hidden", "false");

    btnFecharBootstrap.focus();
}

function fecharModalBootstrap() {
    modalBootstrap.classList.remove("ativo");
    modalBootstrap.setAttribute("aria-hidden", "true");

    btnBootstrap.focus();
}

btnBootstrap.addEventListener("click", abrirModalBootstrap);

btnFecharBootstrap.addEventListener("click", fecharModalBootstrap);

modalBootstrap.addEventListener("click", function (event) {
    if (event.target === modalBootstrap) {
        fecharModalBootstrap();
    }
});

//
// Fechar modais com a tecla ESC
//

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        fecharModal();
        fecharModalBootstrap();
    }
});

//
// FASE 17: Inicialização
//

btnCancelarEdicao.style.display = "none";

carregarDoLocalStorage();
atualizarInterface();
