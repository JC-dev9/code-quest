import { Question } from '../models/types';

// ============================================================
// Banco de perguntas sobre programação/tecnologia
// Mínimo 10 por nível para garantir variedade
// ============================================================

export const QUESTIONS: Question[] = [
    // ============================================================
    // FÁCIL — Conceitos básicos de programação e web
    // ============================================================
    { level: 'Fácil', text: "O que significa HTML?", options: ["HyperText Markup Language", "HighTech Modern Language", "Hyperlink Text Mode"], correctIndex: 0 },
    { level: 'Fácil', text: "Qual destes é um tipo primitivo em JavaScript?", options: ["Object", "String", "Array"], correctIndex: 1 },
    { level: 'Fácil', text: "O que faz a tag <a> em HTML?", options: ["Cria um parágrafo", "Cria uma ligação (link)", "Cria uma imagem"], correctIndex: 1 },
    { level: 'Fácil', text: "CSS significa:", options: ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style System"], correctIndex: 1 },
    { level: 'Fácil', text: "Qual extensão de ficheiro é usada em JavaScript?", options: [".java", ".js", ".py"], correctIndex: 1 },
    { level: 'Fácil', text: "O que é um 'loop' em programação?", options: ["Uma variável", "Uma repetição de código", "Um tipo de dado"], correctIndex: 1 },
    { level: 'Fácil', text: "Qual linguagem é usada para estilizar páginas web?", options: ["JavaScript", "CSS", "Python"], correctIndex: 1 },
    { level: 'Fácil', text: "O que é o console.log() em JavaScript?", options: ["Elimina dados", "Mostra informação na consola", "Cria um ficheiro"], correctIndex: 1 },
    { level: 'Fácil', text: "Que símbolo é usado para comentários de linha em JS?", options: ["/* */", "//", "#"], correctIndex: 1 },
    { level: 'Fácil', text: "O que é o GitHub?", options: ["Um motor de busca", "Uma plataforma de hospedagem de código", "Um sistema operativo"], correctIndex: 1 },
    { level: 'Fácil', text: "Qual destes NÃO é um browser?", options: ["Chrome", "Firefox", "Visual Studio Code"], correctIndex: 2 },
    { level: 'Fácil', text: "O que significa 'bug' em programação?", options: ["Uma funcionalidade", "Um erro no código", "Um tipo de variável"], correctIndex: 1 },

    // ============================================================
    // INTERMÉDIO — Conceitos fundamentais de desenvolvimento
    // ============================================================
    { level: 'Intermédio', text: "Qual a diferença entre == e === em JavaScript?", options: ["Nenhuma", "== compara valor, === valor e tipo", "=== é para strings"], correctIndex: 1 },
    { level: 'Intermédio', text: "Como se declara uma variável que não muda?", options: ["var", "let", "const"], correctIndex: 2 },
    { level: 'Intermédio', text: "O que é uma API?", options: ["Um tipo de base de dados", "Uma interface de programação de aplicações", "Uma linguagem de programação"], correctIndex: 1 },
    { level: 'Intermédio', text: "O que é o DOM?", options: ["Document Object Model", "Data Output Mode", "Digital Operation Manager"], correctIndex: 0 },
    { level: 'Intermédio', text: "Qual método de array adiciona um elemento ao fim?", options: [".pop()", ".push()", ".shift()"], correctIndex: 1 },
    { level: 'Intermédio', text: "O que é JSON?", options: ["JavaScript Object Notation", "Java Simple Output Node", "JavaScript Online Network"], correctIndex: 0 },
    { level: 'Intermédio', text: "Qual a diferença entre let e var?", options: ["Nenhuma", "let tem block scope, var tem function scope", "var é mais moderno"], correctIndex: 1 },
    { level: 'Intermédio', text: "O que é TypeScript?", options: ["Uma base de dados", "Um superset tipado de JavaScript", "Um framework CSS"], correctIndex: 1 },
    { level: 'Intermédio', text: "O que faz o método .map() num array?", options: ["Remove elementos", "Transforma cada elemento e retorna um novo array", "Ordena o array"], correctIndex: 1 },
    { level: 'Intermédio', text: "O que é HTTP?", options: ["Hyper Terminal Transfer Protocol", "HyperText Transfer Protocol", "High Tech Transfer Process"], correctIndex: 1 },
    { level: 'Intermédio', text: "Qual é o código HTTP para 'Não Encontrado'?", options: ["200", "404", "500"], correctIndex: 1 },
    { level: 'Intermédio', text: "O que é o NPM?", options: ["Node Package Manager", "New Programming Method", "Network Protocol Manager"], correctIndex: 0 },

    // ============================================================
    // DIFÍCIL — Conceitos avançados de programação
    // ============================================================
    { level: 'Difícil', text: "O que faz o useMemo em React?", options: ["Memoiza um componente", "Memoiza um valor calculado", "Executa código após render"], correctIndex: 1 },
    { level: 'Difícil', text: "O que é uma Promise em JavaScript?", options: ["Uma variável global", "Um objeto que representa uma operação assíncrona", "Um tipo de loop"], correctIndex: 1 },
    { level: 'Difícil', text: "O que é o Virtual DOM no React?", options: ["O DOM real do browser", "Uma representação em memória do DOM real", "Uma API do browser"], correctIndex: 1 },
    { level: 'Difícil', text: "O que é CORS?", options: ["Cross-Origin Resource Sharing", "Client Object Response System", "Code Optimization Run System"], correctIndex: 0 },
    { level: 'Difícil', text: "O que é SQL Injection?", options: ["Uma técnica de otimização de SQL", "Um ataque que insere código SQL malicioso", "Um tipo de JOIN"], correctIndex: 1 },
    { level: 'Difícil', text: "O que faz o useEffect em React?", options: ["Cria variáveis de estado", "Executa efeitos secundários após render", "Memoiza callbacks"], correctIndex: 1 },
    { level: 'Difícil', text: "O que é WebSocket?", options: ["Um tipo de API REST", "Um protocolo de comunicação bidirecional em tempo real", "Uma base de dados"], correctIndex: 1 },
    { level: 'Difícil', text: "O que é o padrão MVC?", options: ["Model-View-Controller", "Multiple Variable Container", "Modern Visual Code"], correctIndex: 0 },
    { level: 'Difícil', text: "O que é Docker?", options: ["Uma linguagem de programação", "Uma plataforma de contentores", "Um editor de código"], correctIndex: 1 },
    { level: 'Difícil', text: "O que é 'hoisting' em JavaScript?", options: ["Otimização de memória", "Mover declarações para o topo do escopo", "Um tipo de loop"], correctIndex: 1 },
    { level: 'Difícil', text: "Qual é a diferença entre REST e GraphQL?", options: ["São iguais", "REST tem endpoints fixos, GraphQL permite consultas flexíveis", "GraphQL é mais antigo"], correctIndex: 1 },

    // ============================================================
    // EXTREMO — Conceitos de nível sénior/arquitetura
    // ============================================================
    { level: 'Extremo', text: "Qual a complexidade Big O de uma busca binária?", options: ["O(n)", "O(log n)", "O(n²)"], correctIndex: 1 },
    { level: 'Extremo', text: "O que é uma closure em JavaScript?", options: ["Uma função que apaga variáveis", "Uma função que mantém acesso ao escopo da função pai", "Um tipo de classe"], correctIndex: 1 },
    { level: 'Extremo', text: "O que é o Event Loop no Node.js?", options: ["Um tipo de loop for", "O mecanismo que permite operações assíncronas non-blocking", "Um gestor de eventos do DOM"], correctIndex: 1 },
    { level: 'Extremo', text: "O que é o princípio SOLID S (Single Responsibility)?", options: ["Uma classe deve fazer tudo", "Uma classe deve ter apenas uma razão para mudar", "Cada ficheiro deve ter um método"], correctIndex: 1 },
    { level: 'Extremo', text: "O que é um 'deadlock' em sistemas concorrentes?", options: ["Um erro de sintaxe", "Quando dois processos bloqueiam-se mutuamente à espera de recursos", "Uma técnica de otimização"], correctIndex: 1 },
    { level: 'Extremo', text: "O que é o CAP Theorem?", options: ["Consistency, Availability, Partition tolerance — só se podem ter 2 de 3", "Code, Architecture, Performance", "Create, Access, Persist"], correctIndex: 0 },
    { level: 'Extremo', text: "O que é 'memoization'?", options: ["Guardar ficheiros em disco", "Técnica de cache que armazena resultados de funções caras", "Um padrão de design para bases de dados"], correctIndex: 1 },
    { level: 'Extremo', text: "O que é 'currying' em programação funcional?", options: ["Transformar uma função de N argumentos em N funções de 1 argumento", "Um padrão de design OOP", "Uma otimização de compilador"], correctIndex: 0 },
    { level: 'Extremo', text: "O que é o Garbage Collector?", options: ["Um programa que apaga ficheiros", "Um mecanismo automático de gestão de memória", "Um tipo de padrão de design"], correctIndex: 1 },
    { level: 'Extremo', text: "Qual é a complexidade temporal do QuickSort no pior caso?", options: ["O(n log n)", "O(n²)", "O(n)"], correctIndex: 1 },
    { level: 'Extremo', text: "O que é 'race condition'?", options: ["Um tipo de teste", "Quando o resultado depende da ordem de execução de operações concorrentes", "Um padrão de design"], correctIndex: 1 },
];
