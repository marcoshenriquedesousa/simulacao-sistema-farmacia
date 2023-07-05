"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Importar biblioteca para gerar números aleatórios
var random_js_1 = require("random-js");
// Definir constantes
var TEMPO_SIMULACAO = 50; // Tempo total de simulação em minutos
var TEMPO_ATENDIMENTO_MEDICO = 10; // Tempo médio de atendimento com o farmacêutico em minutos
var TEMPO_ATENDIMENTO_CAIXA = 5; // Tempo médio de atendimento no caixa em minutos
var CHEGADA_CLIENTE_MIN = 1; // Intervalo mínimo entre chegadas de clientes em minutos
var CHEGADA_CLIENTE_MAX = 10; // Intervalo máximo entre chegadas de clientes em minutos
// Definir classes
var Cliente = /** @class */ (function () {
    function Cliente(id, chegada) {
        this.id = id;
        this.chegada = chegada;
        this.inicioAtendimento = 0;
        this.fimAtendimento = 0;
    }
    return Cliente;
}());
var Evento = /** @class */ (function () {
    function Evento(tempo, tipo) {
        this.tempo = tempo;
        this.tipo = tipo;
    }
    return Evento;
}());
var Farmacia = /** @class */ (function () {
    function Farmacia(atendentes) {
        this.totalClienteAtendFarceutico = [];
        this.totalClienteFilaFarceutico = [];
        this.totalCleinteAtendCaixa = [];
        this.totalClienteFilaCaixa = [];
        this.atendentes = atendentes;
        this.filaFarmaceutico = [];
        this.filaCaixa = [];
        this.clientes = [];
    }
    Farmacia.prototype.chegadaCliente = function (tempoAtual, agenda) {
        var cliente = new Cliente(this.clientes.length + 1, tempoAtual);
        this.clientes.push(cliente);
        // Verificar se cliente tem receita médica ou apenas quer comprar produtos
        var random = new random_js_1.Random();
        var temReceita = random.bool(0.7); // 70% de chance de ter receita
        if (temReceita) {
            this.filaFarmaceutico.push(cliente);
            //Guarda informação da fila do farmacêutico para gerar o relatório
            this.totalClienteFilaFarceutico.push(cliente);
            console.log("Tempo ".concat(tempoAtual, ": Cliente ").concat(cliente.id, " chegou e est\u00E1 aguardando atendimento com o farmac\u00EAutico."));
            // Verificar se há atendentes disponíveis e se há clientes na fila do farmacêutico
            if (this.atendentes > 0 && this.filaFarmaceutico.length > 0) {
                // Agendar evento de início do atendimento farmacêutico
                agenda.push(new Evento(tempoAtual, "inicioAtendimentoFarmaceutico"));
                this.atendentes--; // Reduzir o número de atendentes disponíveis
            }
        }
        else {
            this.filaCaixa.push(cliente);
            //Guarda informação da fila do caixa para gerar o relatório
            this.totalClienteFilaCaixa.push(cliente);
            console.log("Tempo ".concat(tempoAtual, ": Cliente ").concat(cliente.id, " chegou e est\u00E1 na fila do caixa."));
            // Verificar se há atendentes disponíveis e se há clientes na fila do caixa
            if (this.atendentes > 0 && this.filaCaixa.length > 0) {
                // Agendar evento de início do atendimento do caixa
                agenda.push(new Evento(tempoAtual, "inicioAtendimentoCaixa"));
                this.atendentes--; // Reduzir o número de atendentes disponíveis
            }
        }
        // Agendar próximo evento de chegada de cliente
        var intervaloChegada = random.integer(CHEGADA_CLIENTE_MIN, CHEGADA_CLIENTE_MAX);
        var proximaChegada = tempoAtual + intervaloChegada;
        var novoEvento = new Evento(proximaChegada, "chegadaCliente");
        agenda.push(novoEvento);
    };
    Farmacia.prototype.inicioAtendimentoFarmaceutico = function (tempoAtual, agenda) {
        var cliente = this.filaFarmaceutico.shift();
        cliente.inicioAtendimento = tempoAtual; // Definir o tempo de início do atendimento
        this.clienteAtendidoFarmaceutico = cliente;
        console.log("Tempo ".concat(tempoAtual, ": Cliente ").concat(cliente.id, " est\u00E1 em atendimento com o farmac\u00EAutico."));
        // Agendar evento de término do atendimento farmacêutico
        var tempoTermino = tempoAtual + TEMPO_ATENDIMENTO_MEDICO;
        var novoEvento = new Evento(tempoTermino, "fimAtendimentoFarmaceutico");
        agenda.push(novoEvento);
    };
    Farmacia.prototype.fimAtendimentoFarmaceutico = function (tempoAtual) {
        this.clienteAtendidoFarmaceutico.fimAtendimento = tempoAtual;
        //const cliente: any = this.filaFarmaceutico.shift();
        this.filaCaixa.push(this.clienteAtendidoFarmaceutico);
        //Guarda informação da fila do caixa para gerar o relatório
        this.totalClienteFilaCaixa.push(this.clienteAtendidoFarmaceutico);
        //Guarda informação da fila do farmacêutico para gerar o relatório
        this.totalClienteAtendFarceutico.push(this.clienteAtendidoFarmaceutico);
        console.log("Tempo ".concat(tempoAtual, ": Cliente ").concat(this.clienteAtendidoFarmaceutico.id, " finalizou o atendimento com o farmac\u00EAutico e est\u00E1 na fila do caixa."));
        // Verificar se há atendentes disponíveis e se há clientes na fila do caixa
        if (this.atendentes > 0 && this.filaCaixa.length > 0) {
            // Agendar evento de início do atendimento do caixa
            agenda.push(new Evento(tempoAtual, "inicioAtendimentoCaixa"));
            this.atendentes--; // Reduzir o número de atendentes disponíveis
        }
    };
    Farmacia.prototype.inicioAtendimentoCaixa = function (tempoAtual, agenda) {
        var cliente = this.filaCaixa.shift();
        cliente.inicioAtendimento = tempoAtual; // Definir o tempo de início do atendimento
        this.clienteAtendidoCaixa = cliente;
        console.log("Tempo ".concat(tempoAtual, ": Cliente ").concat(cliente.id, " est\u00E1 sendo atendido no caixa."));
        // Agendar evento de término do atendimento no caixa
        var tempoTermino = tempoAtual + TEMPO_ATENDIMENTO_CAIXA;
        var novoEvento = new Evento(tempoTermino, "fimAtendimentoCaixa");
        agenda.push(novoEvento);
    };
    Farmacia.prototype.fimAtendimentoCaixa = function (tempoAtual) {
        this.clienteAtendidoCaixa.fimAtendimento = tempoAtual;
        this.totalCleinteAtendCaixa.push(this.clienteAtendidoCaixa);
        console.log("Tempo ".concat(tempoAtual, ": Cliente ").concat(this.clienteAtendidoCaixa.id, " finalizou o atendimento no caixa e deixou a farm\u00E1cia."));
    };
    return Farmacia;
}());
function relatorio() {
    if (tempoAtual >= TEMPO_SIMULACAO) {
        // Coletar informações sobre os clientes
        totalClientesChegaram = farmacia.clientes.length;
        totalClientesFarmaceutico = farmacia.totalClienteFilaFarceutico.length;
        totalClientesCaixa = farmacia.totalClienteFilaCaixa.length;
        totalClientesAtendidosFarmaceutico = farmacia.totalClienteAtendFarceutico.length;
        totalClientesAtendidosCaixa = farmacia.totalCleinteAtendCaixa.length;
        // Calcular tempo médio de atendimento com o farmacêutico
        var tempoTotalFarmaceutico = 0;
        for (var _i = 0, _a = farmacia.totalClienteAtendFarceutico; _i < _a.length; _i++) {
            var cliente = _a[_i];
            console.log("Cliente Far", cliente);
            var duracao = cliente.fimAtendimento - cliente.inicioAtendimento;
            tempoTotalFarmaceutico += duracao;
        }
        var tempoMedioFarmaceutico = tempoTotalFarmaceutico / totalClientesAtendidosFarmaceutico;
        // Calcular tempo médio de atendimento no caixa
        var tempoTotalCaixa = 0;
        for (var _b = 0, _c = farmacia.totalCleinteAtendCaixa; _b < _c.length; _b++) {
            var cliente = _c[_b];
            var duracao = cliente.fimAtendimento - cliente.inicioAtendimento;
            tempoTotalCaixa += duracao;
        }
        var tempoMedioCaixa = tempoTotalCaixa / totalClientesAtendidosCaixa;
        console.log("\n\n---------------------");
        console.log("Relatório da Simulação");
        console.log("---------------------");
        console.log("Tempo total de simulação:", TEMPO_SIMULACAO, "minutos");
        console.log("Total de clientes que chegaram:", totalClientesChegaram);
        console.log("Total de clientes na fila do farmacêutico:", totalClientesFarmaceutico);
        console.log("Total de clientes na fila do caixa:", totalClientesCaixa);
        console.log("Total de clientes atendidos pelo farmacêutico:", totalClientesAtendidosFarmaceutico);
        console.log("Total de clientes atendidos pelo caixa:", totalClientesAtendidosCaixa);
        console.log("Total de clientes restantes na fila do farmacêutico:", totalClientesFarmaceutico - totalClientesAtendidosFarmaceutico);
        console.log("Total de clientes restantes na fila do caixa:", totalClientesCaixa - totalClientesAtendidosCaixa);
        console.log("Tempo médio de atendimento com o farmacêutico:", tempoMedioFarmaceutico.toFixed(2), "minutos");
        console.log("Tempo médio de atendimento no caixa:", tempoMedioCaixa.toFixed(2), "minutos");
    }
}
// Simulação
var farmacia = new Farmacia(2); // Criar farmácia com 2 atendentes
var random = new random_js_1.Random();
var tempoAtual = 0;
var agenda = [];
// Agendar primeiro evento de chegada de cliente
var intervaloChegada = random.integer(CHEGADA_CLIENTE_MIN, CHEGADA_CLIENTE_MAX);
var proximaChegada = intervaloChegada;
var primeiroEvento = new Evento(proximaChegada, "chegadaCliente");
agenda.push(primeiroEvento);
// Variáveis para coletar informações durante a simulação
var totalClientesChegaram = 0;
var totalClientesFarmaceutico = 0;
var totalClientesCaixa = 0;
var totalClientesAtendidosFarmaceutico = 0;
var totalClientesAtendidosCaixa = 0;
while (tempoAtual < TEMPO_SIMULACAO) {
    // Ordenar a agenda por tempo
    agenda.sort(function (a, b) { return a.tempo - b.tempo; });
    // Obter próximo evento da agenda
    var eventoAtual = agenda.shift();
    tempoAtual = eventoAtual.tempo;
    // Executar o evento atual
    switch (eventoAtual.tipo) {
        case "chegadaCliente":
            farmacia.chegadaCliente(tempoAtual, agenda);
            break;
        case "inicioAtendimentoFarmaceutico":
            farmacia.inicioAtendimentoFarmaceutico(tempoAtual, agenda);
            break;
        case "fimAtendimentoFarmaceutico":
            farmacia.atendentes++;
            farmacia.fimAtendimentoFarmaceutico(tempoAtual);
            break;
        case "inicioAtendimentoCaixa":
            farmacia.inicioAtendimentoCaixa(tempoAtual, agenda);
            break;
        case "fimAtendimentoCaixa":
            farmacia.atendentes++;
            farmacia.fimAtendimentoCaixa(tempoAtual);
            break;
    }
    relatorio(); // Gerar relatório a cada evento
}
