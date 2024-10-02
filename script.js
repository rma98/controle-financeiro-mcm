// Inicialização de variáveis
let saldoCaixa = parseFloat(localStorage.getItem('saldoCaixa')) || 0;
let historicoTransacoes = JSON.parse(localStorage.getItem('historicoTransacoes')) || [];

// Selecionar elementos
const saldoCaixaDisplay = document.getElementById('saldoCaixa');
const historicoLista = document.getElementById('historico-lista');
const doacaoForm = document.getElementById('doacao-form');
const gastoForm = document.getElementById('gasto-form');
const parcelamentoForm = document.getElementById('parcelamento-form');

// Atualizar a exibição do saldo e histórico
function atualizarDisplay() {
    saldoCaixaDisplay.textContent = saldoCaixa.toFixed(2);
    historicoLista.innerHTML = '';

    historicoTransacoes.forEach((transacao, index) => {
        const li = document.createElement('li');
        li.textContent = `${transacao.tipo}: R$${transacao.valor} - ${transacao.descricao}`;

        // Criar ícone de editar (Font Awesome)
        const editarIcon = document.createElement('i');
        editarIcon.classList.add('fas', 'fa-edit');
        editarIcon.style.cursor = 'pointer';
        editarIcon.style.marginLeft = '10px';
        editarIcon.onclick = () => editarTransacao(index, transacao);

        // Criar ícone de deletar (Font Awesome)
        const deletarIcon = document.createElement('i');
        deletarIcon.classList.add('fas', 'fa-trash');
        deletarIcon.style.cursor = 'pointer';
        deletarIcon.style.marginLeft = '10px';
        deletarIcon.onclick = () => deletarTransacao(index);

        li.appendChild(editarIcon);
        li.appendChild(deletarIcon);

        historicoLista.appendChild(li);
    });
}

// Salvar dados no localStorage
function salvarDados() {
    localStorage.setItem('saldoCaixa', saldoCaixa.toString());
    localStorage.setItem('historicoTransacoes', JSON.stringify(historicoTransacoes));
}

// Função para registrar doação
doacaoForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const valorDoacao = parseFloat(document.getElementById('valorDoacao').value);
    const comentarioDoacao = document.getElementById('comentarioDoacao').value;

    saldoCaixa += valorDoacao;
    historicoTransacoes.push({
        tipo: 'Doação',
        valor: valorDoacao,
        descricao: comentarioDoacao
    });

    atualizarDisplay();
    salvarDados();
    doacaoForm.reset();
});

// Função para registrar gasto
gastoForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const valorGasto = parseFloat(document.getElementById('valorGasto').value);
    const motivoGasto = document.getElementById('motivoGasto').value;

    if (valorGasto > saldoCaixa) {
        alert('Erro: saldo insuficiente!');
        return;
    }

    saldoCaixa -= valorGasto;
    historicoTransacoes.push({
        tipo: 'Gasto',
        valor: valorGasto,
        descricao: motivoGasto
    });

    atualizarDisplay();
    salvarDados();
    gastoForm.reset();
});

// Adicionando barras automaticamente no campo de data
document.getElementById('dataCompra').addEventListener('input', (event) => {
    let data = event.target.value;

    // Remover tudo que não seja número
    data = data.replace(/\D/g, '');

    // Adicionar a barra automaticamente ao digitar
    if (data.length >= 2 && data.length <= 4) {
        data = data.replace(/(\d{2})(\d+)/, '$1/$2');
    } else if (data.length > 4) {
        data = data.replace(/(\d{2})(\d{2})(\d+)/, '$1/$2/$3');
    }

    // Atualizar o campo de input com a data formatada
    event.target.value = data;
});

parcelamentoForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const descricaoCompra = document.getElementById('descricaoCompra').value;
    const parcelas = parseInt(document.getElementById('parcelas').value);
    let dataCompra = document.getElementById('dataCompra').value;

    // Validar e formatar a data
    if (!validarData(dataCompra)) {
        alert('Data inválida! Use o formato dd/mm/yyyy.');
        return;
    }

    // Se a data estiver no formato correto, prosseguir com o parcelamento
    historicoTransacoes.push({
        tipo: 'Parcelamento',
        valor: `Parcelas: ${parcelas}`,
        descricao: `Compra de ${descricaoCompra} em ${dataCompra}`
    });

    atualizarDisplay();
    salvarDados();
    parcelamentoForm.reset();
});

// Função para validar a data no formato dd/mm/yyyy
function validarData(data) {
    const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;

    if (!regex.test(data)) {
        return false;
    }

    const [dia, mes, ano] = data.split('/').map(Number);
    const dataFormatada = new Date(ano, mes - 1, dia);

    if (dataFormatada.getFullYear() === ano &&
        dataFormatada.getMonth() === mes - 1 &&
        dataFormatada.getDate() === dia) {
        return true;
    }

    return false;
}

// Função para editar uma transação
function editarTransacao(index, transacao) {
    const novoValor = prompt('Informe o novo valor:', transacao.valor);
    const novaDescricao = prompt('Informe a nova descrição:', transacao.descricao);

    if (novoValor && novaDescricao) {
        // Atualizar saldo
        if (transacao.tipo === 'Doação') {
            saldoCaixa -= parseFloat(transacao.valor);  // Reverter o valor anterior
            saldoCaixa += parseFloat(novoValor);       // Adicionar o novo valor
        } else if (transacao.tipo === 'Gasto') {
            saldoCaixa += parseFloat(transacao.valor);  // Reverter o valor gasto
            saldoCaixa -= parseFloat(novoValor);       // Subtrair o novo valor
        }

        // Atualizar a transação no histórico
        historicoTransacoes[index] = {
            tipo: transacao.tipo,
            valor: parseFloat(novoValor),
            descricao: novaDescricao
        };

        atualizarDisplay();
        salvarDados();
    }
}

// Função para deletar uma transação
function deletarTransacao(index) {
    const transacao = historicoTransacoes[index];

    // Atualizar saldo conforme o tipo de transação
    if (transacao.tipo === 'Doação') {
        saldoCaixa -= parseFloat(transacao.valor);
    } else if (transacao.tipo === 'Gasto') {
        saldoCaixa += parseFloat(transacao.valor);
    }

    // Remover a transação do histórico
    historicoTransacoes.splice(index, 1);

    atualizarDisplay();
    salvarDados();
}

// Inicializar exibição
atualizarDisplay();
