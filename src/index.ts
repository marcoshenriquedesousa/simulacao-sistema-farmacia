// Importar biblioteca para gerar números aleatórios
import { Random } from "random-js";

// Definir constantes
const TEMPO_SIMULACAO = 50; // Tempo total de simulação em minutos
const TEMPO_ATENDIMENTO_MEDICO = 10; // Tempo médio de atendimento com o farmacêutico em minutos
const TEMPO_ATENDIMENTO_CAIXA = 5; // Tempo médio de atendimento no caixa em minutos
const CHEGADA_CLIENTE_MIN = 1; // Intervalo mínimo entre chegadas de clientes em minutos
const CHEGADA_CLIENTE_MAX = 10; // Intervalo máximo entre chegadas de clientes em minutos

// Definir classes
class Cliente {
  id: number;
  chegada: number;
  inicioAtendimento: number;
  fimAtendimento: number;

  constructor(id: number, chegada: number) {
    this.id = id;
    this.chegada = chegada;
    this.inicioAtendimento = 0;
    this.fimAtendimento = 0;
  }
}

class Evento {
  tempo: number;
  tipo: string;

  constructor(tempo: number, tipo: string) {
    this.tempo = tempo;
    this.tipo = tipo;
  }
}

class Farmacia {
  clientes: Cliente[];
  atendentes: number;
  filaFarmaceutico: Cliente[];
  filaCaixa: Cliente[];
  clienteAtendidoFarmaceutico: any;
  clienteAtendidoCaixa: any;

  //Grava dados para o reltório final
  totalClienteFilaFarceutico: Cliente[];
  totalClienteAtendFarceutico: Cliente[]
  totalClienteFilaCaixa: Cliente[];
  totalCleinteAtendCaixa: Cliente[];

  constructor(atendentes: number) {
    this.totalClienteAtendFarceutico = [];
    this.totalClienteFilaFarceutico = [];
    this.totalCleinteAtendCaixa = [];
    this.totalClienteFilaCaixa = [];
    this.atendentes = atendentes;
    this.filaFarmaceutico = [];
    this.filaCaixa = [];
    this.clientes = [];
  }

  chegadaCliente(tempoAtual: number, agenda: Evento[]) {
    const cliente = new Cliente(this.clientes.length + 1, tempoAtual);
    this.clientes.push(cliente);
    // Verificar se cliente tem receita médica ou apenas quer comprar produtos
    const random = new Random();
    const temReceita = random.bool(0.7); // 70% de chance de ter receita

    if (temReceita) {
      this.filaFarmaceutico.push(cliente);
      //Guarda informação da fila do farmacêutico para gerar o relatório
      this.totalClienteFilaFarceutico.push(cliente);
      console.log(
        `Tempo ${tempoAtual}: Cliente ${cliente.id} chegou e está aguardando atendimento com o farmacêutico.`
      );

      // Verificar se há atendentes disponíveis e se há clientes na fila do farmacêutico
      if (this.atendentes > 0 && this.filaFarmaceutico.length > 0) {
        // Agendar evento de início do atendimento farmacêutico
        agenda.push(new Evento(tempoAtual, "inicioAtendimentoFarmaceutico"));
        this.atendentes--; // Reduzir o número de atendentes disponíveis
      }

    } else {
      this.filaCaixa.push(cliente);
      //Guarda informação da fila do caixa para gerar o relatório
      this.totalClienteFilaCaixa.push(cliente);
      console.log(
        `Tempo ${tempoAtual}: Cliente ${cliente.id} chegou e está na fila do caixa.`
      );

      // Verificar se há atendentes disponíveis e se há clientes na fila do caixa
      if (this.atendentes > 0 && this.filaCaixa.length > 0) {
        // Agendar evento de início do atendimento do caixa
        agenda.push(new Evento(tempoAtual, "inicioAtendimentoCaixa"));
        this.atendentes--; // Reduzir o número de atendentes disponíveis
      }
    }

    // Agendar próximo evento de chegada de cliente
    const intervaloChegada = random.integer(CHEGADA_CLIENTE_MIN, CHEGADA_CLIENTE_MAX);
    const proximaChegada = tempoAtual + intervaloChegada;
    const novoEvento = new Evento(proximaChegada, "chegadaCliente");
    agenda.push(novoEvento);
  }

  inicioAtendimentoFarmaceutico(tempoAtual: number, agenda: Evento[]) {
    const cliente: any = this.filaFarmaceutico.shift();
    cliente.inicioAtendimento = tempoAtual; // Definir o tempo de início do atendimento
    this.clienteAtendidoFarmaceutico = cliente;
    console.log(
      `Tempo ${tempoAtual}: Cliente ${cliente.id} está em atendimento com o farmacêutico.`
    );

    // Agendar evento de término do atendimento farmacêutico
    const tempoTermino = tempoAtual + TEMPO_ATENDIMENTO_MEDICO;
    const novoEvento = new Evento(tempoTermino, "fimAtendimentoFarmaceutico");
    agenda.push(novoEvento);
  }

  fimAtendimentoFarmaceutico(tempoAtual: number) {
    this.clienteAtendidoFarmaceutico.fimAtendimento = tempoAtual;
    //const cliente: any = this.filaFarmaceutico.shift();
    this.filaCaixa.push(this.clienteAtendidoFarmaceutico);
    //Guarda informação da fila do caixa para gerar o relatório
    this.totalClienteFilaCaixa.push(this.clienteAtendidoFarmaceutico);
    //Guarda informação da fila do farmacêutico para gerar o relatório
    this.totalClienteAtendFarceutico.push(this.clienteAtendidoFarmaceutico);
    console.log(
      `Tempo ${tempoAtual}: Cliente ${this.clienteAtendidoFarmaceutico.id} finalizou o atendimento com o farmacêutico e está na fila do caixa.`
    );

    // Verificar se há atendentes disponíveis e se há clientes na fila do caixa
    if (this.atendentes > 0 && this.filaCaixa.length > 0) {
      // Agendar evento de início do atendimento do caixa
      agenda.push(new Evento(tempoAtual, "inicioAtendimentoCaixa"));
      this.atendentes--; // Reduzir o número de atendentes disponíveis
    }
  }

  inicioAtendimentoCaixa(tempoAtual: number, agenda: Evento[]) {
    const cliente: any = this.filaCaixa.shift();
    cliente.inicioAtendimento = tempoAtual; // Definir o tempo de início do atendimento
    this.clienteAtendidoCaixa = cliente;
    console.log(
      `Tempo ${tempoAtual}: Cliente ${cliente.id} está sendo atendido no caixa.`
    );

    // Agendar evento de término do atendimento no caixa
    const tempoTermino = tempoAtual + TEMPO_ATENDIMENTO_CAIXA;
    const novoEvento = new Evento(tempoTermino, "fimAtendimentoCaixa");
    agenda.push(novoEvento);
  }

  fimAtendimentoCaixa(tempoAtual: number) {
    this.clienteAtendidoCaixa.fimAtendimento = tempoAtual;
    this.totalCleinteAtendCaixa.push(this.clienteAtendidoCaixa);
    console.log(`Tempo ${tempoAtual}: Cliente ${this.clienteAtendidoCaixa.id} finalizou o atendimento no caixa e deixou a farmácia.`);
  }
}

function relatorio() {
  if (tempoAtual >= TEMPO_SIMULACAO) {
    // Coletar informações sobre os clientes
    totalClientesChegaram = farmacia.clientes.length;
    totalClientesFarmaceutico = farmacia.totalClienteFilaFarceutico.length;
    totalClientesCaixa = farmacia.totalClienteFilaCaixa.length;
    totalClientesAtendidosFarmaceutico = farmacia.totalClienteAtendFarceutico.length;
    totalClientesAtendidosCaixa = farmacia.totalCleinteAtendCaixa.length;

    // Calcular tempo médio de atendimento com o farmacêutico
    let tempoTotalFarmaceutico = 0;
    for (const cliente of farmacia.totalClienteAtendFarceutico) {
      const duracao = cliente.fimAtendimento - cliente.inicioAtendimento;
      tempoTotalFarmaceutico += duracao;
    }
    const tempoMedioFarmaceutico = tempoTotalFarmaceutico / totalClientesAtendidosFarmaceutico;
    
    // Calcular tempo médio de atendimento no caixa
    let tempoTotalCaixa = 0;
    for (const cliente of farmacia.totalCleinteAtendCaixa) {
      const duracao = cliente.fimAtendimento - cliente.inicioAtendimento;
      tempoTotalCaixa += duracao;
    }
    const tempoMedioCaixa = tempoTotalCaixa / totalClientesAtendidosCaixa;

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
const farmacia = new Farmacia(2); // Criar farmácia com 2 atendentes
const random = new Random();
let tempoAtual = 0;
const agenda: Evento[] = [];

// Agendar primeiro evento de chegada de cliente
const intervaloChegada = random.integer(CHEGADA_CLIENTE_MIN, CHEGADA_CLIENTE_MAX);
const proximaChegada = intervaloChegada;
const primeiroEvento = new Evento(proximaChegada, "chegadaCliente");
agenda.push(primeiroEvento);

// Variáveis para coletar informações durante a simulação
let totalClientesChegaram = 0;
let totalClientesFarmaceutico = 0;
let totalClientesCaixa = 0;
let totalClientesAtendidosFarmaceutico = 0;
let totalClientesAtendidosCaixa = 0;

while (tempoAtual < TEMPO_SIMULACAO) {
  // Ordenar a agenda por tempo
  agenda.sort((a, b) => a.tempo - b.tempo);

  // Obter próximo evento da agenda
  const eventoAtual: any = agenda.shift();
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
