# Problema dello Zaino Binario Multidimensionale

Federico Vancini, *Università degli studi di Ferrara*

``federico.vancini@edu.unife.it``

Progetto del corso *Ricerca Operativa* a.a.2020/21

---

## Introduzione
Il problema dello zaino binario multidimensionale (da ora abbreviato in ``mbk``, *multidensional binary knapsack*) è una diretta generalizzazione del problema dello zaino binario. Quest'ultimo fa parte dei problemi classici nell'ambito dell'informatica teorica ed è un elemento della classe dei problemi *NP-Completi*.

Il problema è di ottimizzazione combinatoria e riguarda la scelta di un sottoinsieme da un insieme di ``n`` elementi, ciascuno con un valore ``v(i)`` ed un vettore di pesi ``w(i, j)`` di dimensione ``k``. L'obiettivo è quello di massimizzare la somma dei valori mantenendo però la somma di ciascuna delle ``k`` componenti dei pesi sotto ad un valore massimo ``m(j)``.

D'ora in poi, a meno di diversa specifica, ``n`` rappresenterà il numero di oggetti in un'istanza di ``mbk``, ``k`` sarà il numero di vincoli dello zaino, ``v(i)`` il valore dell'oggetto ``i``-esimo, ``w(i, j)`` il peso ``j``-esimo dell'oggetto ``i``-esimo, ``m(j)`` il massimo valore per il vincolo ``j``-esimo dello zaino. Come si può intuire, per una migliore comprensione del testo l'indice ``i`` verrà utilizzato per indicare un oggetto e ``j`` un vincolo.

La rappresentazione di una soluzione può essere espressa attraverso un array ``a`` di ``n`` variabili booleane laddove ``a(i) = true`` corrisponde a considerare l'elemento ``i``-esimo nel sottoinsieme. Una scelta equamente espressiva consiste nell'elencare in un sottoinsieme solamente gli indici degli elementi presenti; in questo caso avremo un sottoinsieme di dimensione variabile di valori interi ``1..n``. La scelta implementativa in ognuno dei vari algoritmi presentati sarà dettata da motivazioni operative.

L'applicazione è scritta in *JavaScritpt*, linguaggio ad alto livello per garantire la migliore leggibilità a scapito di prestazioni inferiori ad altri linguaggi come il *C*. Lo scopo dell'attività è quello di fornire un compendio di tecniche risolutive e confrontarle fra loro: il tempo di calcolo risulterà quindi elevato rispetto a del software ottimizzato a basso livello ed è da intendersi come misura relativa fra i vari metodi e non come livello dello stato dell'arte degli algoritmi.

## Algoritmi esatti
I metodi esatti permettono di ottenere la migliore soluzione (od una fra quelle equamente ottimali) ma presentano un comportamento esponenziale per quanto riguarda il tempo di calcolo (e/o lo spazio utilizzato) ma forniscono risultati utili per poter confrontare la bontà di altre soluzioni calcolate in maniera approssimata.

### Enumerazione
La risoluzione *naïve* prevede l'elenco iterativo di tutti i possibili sottoinsiemi di ``n`` elementi (quindi ``2^n`` sottoinsiemi). Ogni istanza dovrà essere testata per l'ammissibilità e poi confrontata con la migliore soluzione finora incontrata durante la ricerca.

```javascript
function enumeration(instance) {
  const numSolutions = 2 ** n - 1;
  let bestArray = null;
  let bestValue = -Infinity;
  let array = createInitialBoolArray(instance);
  for (let i = 0; i < numSolutions; i++) {
    const value = getValueFromBoolArray(array, instance);
    if (value >= bestValue) {
      bestArray = array.slice();
      bestValue = value;
    }
    array = getNextBoolArray(array, instance);
  }
  return bestArray;
}
```

Nel codice sopra riportato ``createInitialBoolArray`` crea un array di ``n`` elementi ``false`` come soluzione iniziale, ``getValueFromBoolArray`` ritorna il valore della somma degli elementi scelti oppure ``-Infinity`` in caso di non ammissibilità. ``getNextBoolArray`` vede l'array booleano come un numero in binario ed effettua la somma di 1 a tale valore, ottenendo la stringa di bit successiva numericamente; questa funzione è sfruttata per ottenere efficientemente tutte le possibili combinazioni di soluzioni possibili.

### Ricerca ad albero
Si può ottimizzare notevolmente l'approccio precedente ragionando con una differente visione della struttura di una soluzione: quest'ultima altro non è che un sottoinsieme di elementi e pertanto può essere memorizzata come tale. La ricerca ad albero parte da un nodo radice a cui è associato l'insieme vuoto e procede con una politica di visita *depth-first* via via aggiungendo elementi per generare nuovi nodi.

L'implementazione scelta ottimizza i calcoli sfruttando valori che vengono passati dai genitori ai figli e che permettono di calcolare velocemente l'ammissibilità delle nuove soluzioni (``remainingSpace``) ed il valore totale degli elementi presenti nel sottoinsieme corrente (``value``).

```javascript
function visit(set, remaining, value, remainingValue, remainingSpace, best, instance) {
  ...
  while (remaining.length > 0) {

    const item = remaining.pop();
    const childRemainingSpace = [];

    let feasible = true;
    for (let i = 0; i < k; i++) {
      childRemainingSpace[i] = remainingSpace[i] - w[i][item];
      if (childRemainingSpace[i] < 0) {
        feasible = false;
        break;
      }
    }
    if (!feasible) continue;

    const childSet = set.slice();
    childSet.push(item);
    const itemValue = v[item];
    const childValue = value + itemValue;
    if (childValue > best.value) {
      best.set = childSet.slice();
      best.value = childValue;
    }

    const childRemainingValue = remainingValue - itemValue;
    if (childRemainingValue + childValue <= best.value) {
      continue;
    }

    visit(childSet, remaining.slice(), childValue, childRemainingValue, childRemainingSpace, best, instance);
  }
}
```

Il ciclo ``while`` esterno itera sull'insieme ``remaining`` che contiene gli elementi non ancora testati in un certo ramo di ricerca dell'albero.

Se il valore di una delle soluzioni figlie ha un valore superiore a quella migliore finora incontrata allora la si memorizza nella variabile ``best`` che verrà passata a tutti i discendenti.

Se il valore totale degli elementi presenti in ``remaining`` (immagazzinato in ``remainingValue``) non è abbastanza alto da consentire la presenza di una soluzione migliorativa allora si può effettuare una potatura data dall'istruzione ``continue``.

La chimata iniziale al nodo radice è descritta dal seguente codice:

```javascript
function treeSearch(instance) {
  ...
  const best = {
    set: [],
    value: 0
  };
  const remaining = [];
  let remainingValue = 0;
  for (let i = 0; i < n; i++) {
    remaining.push(i);
    remainingValue += v[i];
  }
  visit([], remaining, 0, remainingValue, m.slice(), best, instance);
  return new Set(best.set);
}
```

### Programmazione dinamica
Il problema ``mbk`` con pesi **interi** può essere affrontato utilizzando il concetto di programmazione dinamica. Si sfrutta un matrice multidimensionale per immagazzinare le soluzioni parziali migliori finora incontrate secondo alcuni vincoli, garantendo il risultato ottimo nella casella di indici maggiori dopo l'ultima iterazione.

La matrice avrà ``k + 1`` dimensioni. La prima di queste, che spazia da ``0`` ad ``n``, identifica il massimo indice dell'oggetto utilizzabile nelle soluzioni parziali. Le successive ``k`` dimensioni spaziano da ``0`` a ``m(j)`` per ogni ``j`` da ``1`` a ``k`` e fissano un vincolo riguardo il massimo peso degli oggetti utilizzabili.

Inizialmente la matrice viene inizializzata con tutti i valori a ``0``.

La matrice viene riempita dal livello ``1`` al livello ``n`` della prima dimensione, sfruttando solamente i valori presenti al livello precedente: questi denotano le migliori soluzioni parziali trovate.

Di seguito è presente l'implementazione dell'algoritmo per un problema bidimensionale (``k = 2``).

```javascript
function loadMatrix(matrix, instance) {
  ...
  for (let j = 0; j < n; j++) {

    for (let i = 0; i <= m[0]; i++) {
      for (let l = 0; l <= m[1]; l++) {

        if (w[0][j] > i || w[1][j] > l) {

          const cellPrev = matrix[0][i][l];
          const cellNext = matrix[1][i][l];
          cellNext.value = cellPrev.value;
          cellNext.set = cellPrev.set;

        } else {

          const cellPrev = matrix[0][i][l];
          const cellNext = matrix[1][i][l];
          const cellMaybe = matrix[0][i - w[0][j]][l - w[1][j]];

          if (cellPrev.value > cellMaybe.value + v[j]) {
            cellNext.value = cellPrev.value;
            cellNext.set = cellPrev.set;
          } else {
            cellNext.value = cellMaybe.value + v[j];
            cellNext.set = new Set(cellMaybe.set);
            cellNext.set.add(j);
          }
        }
      }
    }

    const temp = matrix[0];
    matrix[0] = matrix[1];
    matrix[1] = temp;

  }

  return matrix[0][m[0]][m[1]].set;
}
```

Nel codice il ciclo con ``j`` scorre i livelli; questi ultimi sono immagazzinati riutilizzando lo stesso spazio poichè da un punto di vista operativo le uniche informazioni necessarie per riempire il livello ``j`` sono tutte immagazzinate nel livello ``j - 1``. La variabile ``temp`` permette di scambiare il livello ``0`` di memoria precedente col livello ``1`` di calcolo.

Se i pesi dell'oggetto non verificano i vincoli di dimensionalità dati da ``i`` e ``l`` allora il valore nel livello corrente sarà uguale a quello del livello precedente. Il contenuto della cella corrente sarà modificato solo se il fatto di inserire l'oggetto ``j``-esimo porta ad un miglioramento del valore della soluzione rispetto a quello precedentemente trovato, altrimenti si effettuerà ancora una semplice copia del valore del livello precedente.

Il risultato, dato che ``k = 2`` nell'esempio, si leggerà nella cella ``matrix(0, m(0), m(1))``.

La complessità in tempo dell'algoritmo di programmazione dinamica può sembrare polinomiale, ed in effetti lo è in ``n`` ed in ``k``, ma la struttura dati utilizzata necessita di uno spazio che dipende dal prodotto di tutti i valori ``m(j)``. Il fatto che il numero di caselle totali (con o senza l'ottimizzazione del riuso dello spazio) dipenda da un valore che nell'istanza in input è codificato in binario rende l'intero metodo pseudopolinomiale, ovvero polinomiale secondo i parametri ma non secondo la dimensione dell'istanza codificata in entrata.

Questo metodo è l'unico fra quelli trattati che fornisce soluzioni esatte mantenendo ottime prestazioni per istanze che possiedono pesi *interi* e di valore relativamente *piccolo*.

### Algoritmo del simplesso
Un approccio diverso rispetto ai precedenti è dato dalla programmazione lineare. Il problema della programmazione lineare *intera* non ha algoritmi polinomiali, ma è possibile rilassare la definizione di ``mbk`` permettendo alle variabili decisionali di assumere un qualsiasi valore nell'intervallo a virgola mobile ``[0, 1]``.

Per mantenere la struttura del problema sarà necessario definire ``k`` disequazioni di dimensionalità dello zaino che coinvolgeranno le ``n`` variabili decisionali, i pesi ``w(i, j)`` ed il vettore ``m(j)``.

Oltre a questi ultimi, bisognerà aggiungere ``n`` vincoli aggiuntivi del tipo ``x(i) <= 1``, dove ``x(i)`` è il valore della variabile ``i``-esima, per ogni ``i`` da ``1`` a ``n``.

Il sistema di disequazioni avrà quindi ``n + k`` vincoli con ``n`` variabili. Il simplesso necessita di una variabile di slack per ogni disequazione e quindi il numero effettivo di variabili salirà a ``n + n + k``.

La struttura generale dell'algoritmo può essere riassunta dal codice sottostante.

```javascript
function simplex(maxIterations, instance) {

  const tableau = createTableau(instance);
  for (let i = 0; i < maxIterations; i++) {

    const pivotColumnIndex = findPivotColumnIndex(tableau, instance);
    if (pivotColumnIndex === null) break;
    const pivotRowIndex = findPivotRowIndex(pivotColumnIndex, tableau, instance);

    pivot(pivotRowIndex, pivotColumnIndex, tableau, instance);
  }

  const array = extractSolution(tableau, instance);
  return array;
}
```

Il sistema di disequazioni è immagazzinato nella variabile ``tableau`` assieme ad altre informazioni relative alla funzione obiettivo, ed iterativamente si va a scegliere uan casella su cui fare un operazione di *pivot* che scambia una delle variabili in base con una delle variabili fuori base. Geometricamente questa operazione corrisponde allo spostarsi su di un politotipo ``n + k`` dimensionale verso un vertice sempre più distante dall'origine in direzione data dal vettore ``v(i)`` della funzione obiettivo.

L'operazione di pivot permette di annullare tutti i coefficienti nella colonna dell'elemento scelto (a parte il coefficiente della riga scelta) attraverso la somma con dei multipli della riga di pivot.

```javascript
function pivot(pivotRowIndex, pivotColumnIndex, tableau, instance) {
  ...
  const equationsNumber = n + k + 1;
  const variableNumber = n + n + k + 1;
  const pivotRow = tableau[pivotRowIndex];
  const pivotValue = pivotRow[pivotColumnIndex];
  for (let i = 0; i < equationsNumber; i++) {
    if (i === pivotRowIndex) {
      continue;
    }
    const row = tableau[i];
    const value = row[pivotColumnIndex];
    const multiplicationAmount = -value / pivotValue;
    for (let j = 0; j <= variableNumber; j++) {
      row[j] += pivotRow[j] * multiplicationAmount;
    }
  }
}
```

Un aspetto che risulta degno di nota è il fatto che le soluzioni trovate attraverso il rilassamento lineare del problema possono contenere valori non interi delle variabili decisionali.

## Algoritmi approssimati
Non è noto nessun algoritmo completamente polinomiale al problema dello zaino generalizzato pertanto è lecito affidarsi a diverse tecniche approssimate che, seppur presentando errori, permettono di ottenere una soluzione accettabile entro un tempo e con risorse ragionevoli.

### Algoritmo genetico
Gli algoritmi genetici rispecchiano il comportamento della vita reale vista come processo continuo di tentativi ed incroci di caratteristiche.

Esistono diverse varianti di questa tecnica di ricerca che possiedono una struttura comune: una *popolazione*, costituita da *individui*, evolve per un certo numero di iterazioni ogni volta ricombinando parte delle soluzioni in operazioni di *crossover* ed eventualmente apportando piccole modifiche con operazioni di *mutazione*.

La struttura dell'algoritmo è la seguente:

```javascript
function geneticAlgorithm(populationSize, generationAmount, crossoverPercentage, mutationPercentage, instance) {

  let population = generatePopulation(populationSize, instance);
  sortPopulation(population);
  let bestArray = population[0].array;
  let bestValue = -Infinity;

  for (let i = 0; i < generationAmount; i++) {

    population = crossoverStep(population, crossoverPercentage, instance);
    mutationStep(population, mutationPercentage, instance);
    sortPopulation(population);

    const bestIndividual = population[0];
    if (bestIndividual.value > bestValue) {
      bestArray = bestIndividual.array;
      bestValue = bestIndividual.value;
    }

  }

  return bestArray;
}
```

I parametri che influenzano l'efficacia sono:
- ``populationSize`` che determina il numero di individui presenti in ogni iterazione,
- ``generationAmount`` che controlla il numero di evoluzioni fatte dalla popolazione,
- ``crossoverPercentage`` e ``mutationPercentage`` che inducono una maggiore o minore conservazione delle caratteristiche degli individui.

Il processo di creazione di un algoritmo genetico è sempre dettato in una certa misura da tentativi per quanto riguarda la codifica della soluzione all'interno degli individui, la procedura di crossover e quella di mutazione.

La performance che ogni individuo possiede relativamente al problema in esame è riassunta da un valore denominato *fitness*, ed è fondamentale che la selezione dei genitori nella fase di crossover penda a favore di quelle soluzioni a fitness maggiore: da un punto di vista biologico le caratteristiche degli individui migliori è più probabile che si espandano nel patrimonio genetico delle generazioni successive in quanto tali esemplari risultano più avvantaggiati nella sopravvivenza.

Il problema ``mbk`` è stato codificato seguendo la sua naturale predisposizione a vedere le soluzioni come stringhe binarie di ``n`` bit.

Per quanto riguarda il crossover, i bit dei due genitori vengono mischiati con una procedura che dipende dal valore di un parametro che ne determina il grado di confusione: ``0`` oppure ``1`` equivale a nessun crossover e ``0.5`` significa che il crossover è massimamamente sparso.

```javascript
function crossoverIndividuals(parents, crossoverPercentage, instance) {
  ...
  const childArray1 = [], childArray2 = [];
  const parentArray1 = parents[0].array, parentArray2 = parents[1].array;

  for (let j = 0; j < n; j++) {

    if (Math.random() < crossoverPercentage) {
      childArray1[j] = parentArray1[j];
      childArray2[j] = parentArray2[j];
    } else {
      childArray1[j] = parentArray2[j];
      childArray2[j] = parentArray1[j];
    }

  }

  return [
    {array: childArray1},
    {array: childArray2}
  ];
}

function crossoverStep(population, crossoverPercentage, instance) {
  const populationLength = population.length;
  const newPopulation = [];
  while (newPopulation.length < populationLength) {
    const parents = selectParents(population);
    const children = crossoverIndividuals(parents, crossoverPercentage, instance);
    newPopulation.push(...children);
  }
  return newPopulation;
}
```

La mutazione è un processo relativamente semplice che consiste in una inversione del valore di un singolo bit nella soluzione. Il numero di individui affeti dalla mutazione è determinato dal parametro ``mutationPercentage``.

```javascript
function mutateIndividual(individual, instance) {
  ...
  const randomIndex = Math.floor(Math.random() * n);
  individual.array[randomIndex] = !individual.array[randomIndex];
  individual.value = getValueFromBoolArray(individual.array, instance);
}

function mutationStep(population, mutationPercentage, instance) {
  const populationLength = population.length;
  const numberOfMutations = Math.floor(populationLength * mutationPercentage);
  for (let i = 0; i < numberOfMutations; i++) {
    const randomIndex = Math.floor(Math.random() * populationLength);
    mutateIndividual(population[randomIndex], instance);
  }
}
```

Un'importante osservazione può essere fatta sull'ammissibiltà: gli individui che possiedono soluzioni che non rispettano i vincoli del problema vengono comunque mantenuti nella popolazione con valori di fitness molto negativi. Questa scelta permette di ottenere una migliore copertura durante la ricerca in quanto il raggiungimento di ottimi globali non è inficiato da 'muri' di soluzioni non ammissibili.

### Ricerca tabù
La tecnica della ricerca tabù è una variante della ricerca locale in quanto esplora lo spazio di ricerca (in ``mbk`` tutti i possibili array booleani lunghi ``n``) effettuando iterativamente dei passi osservando solamente un certo sottoinsieme delle soluzioni considerate *vicine* secondo una certa funzione di distanza. Tale insieme è spesso denominato *vicinato* od *intorno* e costituisce il ventaglio di possibili soluzioni su cui spostarsi e fare ripartire la ricerca nell'iterazione successiva.

Il concetto di vicinato scelto nell'implementazione sottostante utilizza il numero di variazioni bit-a-bit delle stringhe binarie corrispondenti alle varie soluzioni. La distanza massima ammissibile è 1, ovvero tutte quelle stringhe che differiscono di un solo elemento.

La soluzione scelta nel vicinato sarà quella che possiede il miglior valore della funzione obiettivo.

Il metodo di ricerca tabù fornisce anche una struttura a coda aggiuntiva per memorizzare i ``t`` passi precedenti (le ``t`` soluzioni visitate) che sono vietate e considerate estranee a qualsiasi vicinato per tutta la loro permanenza nella coda. Questa modifica della ricerca locale classica permette di evitare di cadere in ottimi locali prematuramente in problemi che possiedono una funzione obiettivo particolarmente prona a possedere tali attrattori non ottimi globalmente.

```javascript
function tabuSearch(steps, tabuListMaxLength, instance) {

  let current = {
    array: [],
    value: 0
  };
  current.array = getRandomArray(instance);
  current.value = getValueFromBoolArray(current.array, instance);

  const best = {
    array: current.array,
    value: current.value
  };

  const tabuList = [];
  for (let i = 0; i < steps; i++) {

    current = visitNeighbourhood(current, tabuList, instance);
    if (current.value < 0) {
      current.array = getRandomArray(instance);
      current.value = getValueFromBoolArray(current.array, instance);
    }

    tabuList.push(current.array);
    if (tabuList.length > tabuListMaxLength) {
      tabuList.shift();
    }

    if (current.value > best.value) {
      best.array = current.array;
      best.value = current.value;
    }
  
  return best.array;
}
```

I parametri utilizzati nell'implementazione soprastante sono ``steps``, che definisce il numero di passi nel cammino di ricerca locale, e ``tabuListMaxLength`` che stabilisce la dimensione della coda delle soluzioni tabù.

La soluzione migliore finora incontrata viene salvata in un'apposita variabile ``best`` e costituisce il risultato della ricerca.

Se si incappa in una qualche soluzione non ammissibile (che è sintomo di un intero vicinato non ammissibile, per via della modalità di scelta dei passi nel vicinato) allora viene fatta ripartire la ricerca da un altro luogo casuale nello spazio delle possibili soluzioni.

### Sciami e branchi
In natura gli esseri viventi di varie specie hanno evoluto un comportamento sociale che permette loro di far parte di un'entità con caratteristiche proprie dell'insieme. Tale strategia può essere mimata attraverso delle tecniche di ricerca denominate a *sciami* od a *branchi*.

Una *popolazione*, composta da *individui*, si sposta nello spazio di ricerca tramite dei passi ad ogni iterazione. Esistono molte variazioni sul tema, ma in generale per stabilire la 'direzione' di spostamento entrano in gioco fattori come l'inerzia , il comportamento del branco nell'insieme, il comportamento del vicinato dell'individuo ed eventualmente attrattori dati dal valore delle soluzioni migliori finora scoperte durante la ricerca.

Nell'implementazione sottostante ogni soluzione è codificata come un array lungo ``n`` di valori probabilistici compresi fra ``0`` ed ``1`` che identificano la probabilità che un certo bit sia uguale ad ``1``. In tale modo si riesce ad interpretare in maniera continua uno spostamento che altrimenti sarebbe discreto e limitato ai due valori logici ``true`` e ``false``.

Per calcolare il valore di uno di questi vettori probabilistici si ricorre alla generazione di un vettore discreto booleano in maniera casuale seguendo le probabilità date.

Se la soluzione booleana trovata non è ammissibile per i vincoli di zaino allora si ricorre ad un operatore di riparazione ``repair`` che elimina dalla soluzione degli elementi finché non si raggiunge una stringa binaria ammissibile. Gli oggetti sono rimossi a partire da quelli di minor rapporto fra il valore ``v(i)`` ed il loro massimo peso ``w(i, j)``.

```javascript
function swarmSearch(iterationNumber, swarmLength, inertiaPercentage, socialPercentage, instance) {

  const swarm = generateSwarm(swarmLength, instance);
  let best = findBest(swarm, swarmLength);

  for (let i = 0; i < iterationNumber; i++) {

    for (let j = 0; j < swarmLength; j++) {
      const individual = swarm[j];
      moveIndividual(individual, inertiaPercentage, socialPercentage, best, instance);

      const boolArray = getBoolArrayFromArray(individual.array, instance);
      repair(boolArray, instance);
      const value = getValueFromBoolArray(boolArray, instance);
      if (value > individual.best.value) {
        individual.best = {
          array: individual.array.slice(),
          boolArray: boolArray,
          value: value
        };
        if (value > best.value) {
          best = {
            array: individual.array.slice(),
            boolArray: boolArray,
            value: value
          };
        }
      }

    }
  }

  return best.boolArray;
}
```

La procedura ``generateSwarm`` istanzia ``swarmLength`` boolean array con percentuali casuali. ``findBest`` viene utilizzata per inizializzare il valore dell'oggetto ``best`` che ad ogni iterazione memorizzerà il valore della miglior soluzione ottenuta durante la ricerca.

La funzione ``moveIndividual`` viene chiamata una volta per ogni individuo ad ogni iterazione e modifica i valori delle percentuali nell'array probabilistico.

```javascript
function moveIndividual(individual, inertiaPercentage, socialPercentage, best, instance) {
  ...
  const array = individual.array;
  const bestAllArray = best.array;
  const bestArray = individual.best.array;
  for (let i = 0; i < n; i++) {
    array[i] = array[i] * inertiaPercentage +
      bestAllArray[i] * socialPercentage +
      (1 - inertiaPercentage - socialPercentage) * bestArray[i];
  }
}
```

La nuova percentuale ``i``-esima è data per una certa misura dal valore che vi era precedentemente (misura stabilita dal parametro ``inertiaPercentage``) e parzialmente dal valore migliore che il branco ha incontrato finora (dettato dal parametro ``socialPercentage``). La percentuale rimanente sarà riempita dal valore più performante che l'individuo ha finora incontrato e che, a differenza della porzione sociale inferita dal branco nell'insieme, dipenderà solamente dalla 'memoria' del singolo membro.

## Test sperimentali

### Ambiente di test

Il codice JavaScript è stato testato da una macchina Windows con processore Intel i5-4670 @ 3.40GHz e con 16GB di memoria RAM.

L'applicazione scelta come interprete del codice è ``node.js`` con versione ``v16.3.0`` (visibile con ``node --version``). Se si utilizza una versione differente del software è necessario che i moduli ECMAscript siano supportati.

Per salvare le istanze su file di testo (formato ``.txt``) si sfrutta una codifica generale:

- la prima riga del file contiene due interi, ``n`` e ``k`` che identificano il numero di elementi ed il numero di vincoli di zaino,
- le successive ``n`` righe contengono ``k + 1`` valori, il primo di questi è il valore ed i successivi ``k`` i pesi dell'elemento,
- l'ultima riga contiene i ``k`` valori massimi di ciascun vincolo di zaino.

Un esempio di file di istanza con ``n = 7``, ``k = 2``, ``m = [16, 16]`` e ``v = [3, 3, 5, 7, 3, 9, 4]`` è riportato di seguito.

```
7 2
3 3 6
3 8 2
5 1 5
7 1 7
3 2 2
9 4 7
4 8 6
16 16
```

I file vengono automaticamente creati dal programma ``createFile.mjs`` eseguibile con uno dei seguenti comandi:

- ``node createFile.mjs`` per creare un file ``output.txt`` di esempio,
- ``node createFile.mjs test`` per generare tutti i test automaticamente,
- ``node createFile.mjs test <n>`` per generare n test,
- ``node createFile.mjs <file.txt> <n> <k>`` per generare un esempio con n oggetti e k vincoli.

I file di test generati automaticamente sono salvati nella cartella ``./tests/`` relativa all'ambiente di esecuzione del comando.

Per eseguire dei test con tutti i metodi in sequenza usare i seguenti comandi:

- ``node main.mjs test`` per eseguire tutti i test,
- ``node main.mjs test <n>`` per i test da 1 a n,
- ``node main.mjs <file.txt>`` per testare l'istanza in ``file.txt``

La cartella in cui i primi due comandi cercano i file di test è la stessa utilizzata dai comandi di creazione di istanze.

Il risultato del terzo comando viene riportato in console, mentre per i test automatici viene creato un file ``results.txt`` contenente solo i tempi di esecuzione.

Un esempio di output da console è riportato di seguito.

```
> node main.mjs tests/test1.txt
File read successfully

n = 7, k = 2
3 8 1 1 2 4 8  <= 16
6 2 5 7 2 7 6  <= 16
3 3 5 7 3 9 4

Enum:   [0110110] in 0.0003s    (20)
Tree:   [0110110] in 0.0002s    (20)
Dynamic:[0110110] in 0.0021s    (20)
Genetic:[0101010] in 0.0149s    (19)
Tabu:   [0110110] in 0.003s     (20)
Swarm:  [0110110] in 0.032s     (20)
Simplex:[0 1 0 1 0 1 0] in 0.0007s      (19)
```

L'ultima riga presenta un differente formato di scrittura in quanto riporta valori a virgola mobile e non booleani (potrebbe quindi presentare numeri non interi).

I test sono effettuati variando il valore di ``n`` mantenendo ``k`` costante per evitare di creare distorsioni che invaliderebbero le performance. I tempi di esecuzione non sono da considerarsi come ottimizzati in quanto sia il linguaggio di programmazione che le implementazioni non spingono verso lo stato dell'arte.

Le grandezze dei valori interi utilizzati come pesi saranno mantenute nell'intervallo ``1..10`` per tutti i test a parte per quelli che mireranno ad osservare il comportamento del metodo di programmazione dinamica.

- I test che riguardano l'algoritmo genetico sono eseguiti fornendo i seguenti parametri:

  - ``100`` individui per popolazione,
  - ``100`` generazioni,
  - ``0.8`` come percentuale di crossover,
  - ``0.2`` come percentuale di mutazione.

- I test con la ricerca tabù utilizzano cammini di ``100`` passi con code lunghe ``10`` elementi.

- Il simplesso procede per un massimo di ``100`` operazioni di pivot.

- La ricerca a branco sfrutta:

  - ``100`` individui nel branco,
  - ``100`` iterazioni dell'algoritmo,
  - ``0.8`` come fattore di inerzia,
  - ``0.1`` come fattore sociale.

### Test su istanze

Un primo test può essere eseguito per osservare l'andamento del tempo di esecuzione dei vari metodi risolutivi:

n | k | Enum | Tree | Dynamic | Genetic | Tabu | Simplex | Swarm
-- | -- | -- | -- | -- | -- | -- | -- | --
6 | 2 | 0.0002s | 0.0001s | 0.0013s | 0.014s | 0.002s | 0.0006s | 0.025s
7 | 2 | 0s | 0s | 0.0007s | 0.0085s | 0.0009s | 0s | 0.0277s
8 | 2 | 0s | 0s | 0.001s | 0.0044s | 0.0005s | 0.0001s | 0.0231s
9 | 2 | 0.0002s | 0.0001s | 0.0023s | 0.0035s | 0.0007s | 0.0001s | 0.0069s
10 | 2 | 0.0002s | 0.0001s | 0.0005s | 0.0024s | 0.0013s | 0.0002s | 0.0074s
11 | 2 | 0.0005s | 0.0011s | 0.0013s | 0.0034s | 0.0003s | 0.0003s | 0.0242s
12 | 2 | 0.0014s | 0.0001s | 0.0015s | 0.0034s | 0.0006s | 0.0006s | 0.0073s
13 | 2 | 0.0062s | 0.0005s | 0.0018s | 0.0035s | 0.0003s | 0s | 0.0092s
14 | 2 | 0.0074s | 0.0004s | 0.0019s | 0.0036s | 0.0012s | 0s | 0.0092s
15 | 2 | 0.0038s | 0.0012s | 0.0032s | 0.0036s | 0.0005s | 0s | 0.0099s
16 | 2 | 0.0082s | 0.0019s | 0.0029s | 0.0034s | 0.0005s | 0s | 0.01s
17 | 2 | 0.0152s | 0.0035s | 0.0031s | 0.0038s | 0.0008s | 0s | 0.0104s
18 | 2 | 0.0342s | 0.0057s | 0.0045s | 0.0051s | 0.0007s | 0s | 0.0129s
19 | 2 | 0.0719s | 0.0276s | 0.0071s | 0.0036s | 0.001s | 0.0004s | 0.0111s
20 | 2 | 0.1391s | 0.025s | 0.0059s | 0.0037s | 0.0008s | 0.0001s | 0.0115s
21 | 2 | 0.292s | 0.0784s | 0.0068s | 0.0041s | 0.0009s | 0.0001s | 0.0134s
22 | 2 | 0.529s | 0.0567s | 0.0068s | 0.0044s | 0.001s | 0.0001s | 0.0152s
23 | 2 | 1.1778s | 0.1573s | 0.0085s | 0.0039s | 0.0009s | 0.0005s | 0.014s
24 | 2 | 2.5342s | 0.3447s | 0.0112s | 0.004s | 0.0012s | 0.0001s | 0.0152s
25 | 2 | 4.8685s | 0.6103s | 0.0105s | 0.0044s | 0.0011s | 0.0001s | 0.016s

L'enumerazione di tutte le possibili soluzioni richiede prevedibilmente un tempo considerevole comparata agli altri metodi (anche esatti) e pertanto verrà omessa dalle analisi che coinvolgeranno istanze con un numero di elementi superiore a ``25``.

n | k | Enum | Tree | Dynamic | Genetic | Tabu | Simplex | Swarm
-- | -- | -- | -- | -- | -- | -- | -- | --
6 | 2 | 0.0002s | 0.0003s | 0.0014s | 0.0134s | 0.0019s | 0.0004s | 0.0265s
8 | 2 | 0s | 0s | 0.0012s | 0.0101s | 0.0014s | 0.0003s | 0.0225s
9 | 2 | 0.0001s | 0.0001s | 0.0026s | 0.0044s | 0.0005s | 0.0001s | 0.0251s
11 | 2 | 0.0005s | 0.0002s | 0.0008s | 0.0035s | 0.0007s | 0.0001s | 0.0075s
12 | 2 | 0.0013s | 0.0017s | 0.0019s | 0.0032s | 0.0015s | 0.0003s | 0.0084s
14 | 2 | 0.0063s | 0.0009s | 0.0017s | 0.0035s | 0.0005s | 0.0007s | 0.0076s
15 | 2 | 0.0099s | 0.002s | 0.0026s | 0.0031s | 0.0005s | 0s | 0.009s
17 | 2 | 0.0172s | 0.0047s | 0.0053s | 0.0042s | 0.0006s | 0s | 0.0107s
18 | 2 | 0.034s | 0.0074s | 0.0048s | 0.0051s | 0.0006s | 0s | 0.0157s
20 | 2 | 0.1438s | 0.0385s | 0.0077s | 0.0043s | 0.0009s | 0s | 0.0134s
21 | 2 | 0.2793s | 0.0486s | 0.0081s | 0.004s | 0.0008s | 0.0004s | 0.012s
23 | 2 | 1.2826s | 0.458s | 0.0139s | 0.0042s | 0.001s | 0.0001s | 0.0141s
24 | 2 | 2.4983s | 0.4238s | 0.0107s | 0.0041s | 0.0011s | 0.0001s | 0.0142s
26 | 2 | ---s | 2.173s | 0.0197s | 0.0046s | 0.0016s | 0.0002s | 0.0162s
27 | 2 | ---s | 2.3646s | 0.0171s | 0.0042s | 0.0012s | 0.0004s | 0.0192s
29 | 2 | ---s | 12.1298s | 0.02s | 0.0054s | 0.0016s | 0.0001s | 0.0196s
30 | 2 | ---s | 27.7759s | 0.0313s | 0.0064s | 0.0017s | 0.0001s | 0.0203s

Per dimensioni del problema superiori anche il metodo di ricerca ad albero manifesta il suo comportamento esponenziale ed i suoi tempi di esecuzione verranno tralasciati.

n | k | Enum | Tree | Dynamic | Genetic | Tabu | Simplex | Swarm
-- | -- | -- | -- | -- | -- | -- | -- | --
32 | 2 | ---s | ---s | 0.098s | 0.0145s | 0.006s | 0.0029s | 0.0422s
32 | 2 | ---s | ---s | 0.358s | 0.0133s | 0.0058s | 0.0005s | 0.0332s
32 | 2 | ---s | ---s | 0.7541s | 0.0089s | 0.002s | 0.0002s | 0.0352s
32 | 2 | ---s | ---s | 1.5714s | 0.0088s | 0.0021s | 0.0002s | 0.02s
32 | 2 | ---s | ---s | 1.9839s | 0.0053s | 0.0039s | 0.0002s | 0.0221s
32 | 2 | ---s | ---s | 3.2763s | 0.0087s | 0.0021s | 0.0002s | 0.0195s
32 | 2 | ---s | ---s | 3.4317s | 0.008s | 0.0019s | 0.0055s | 0.0238s

Nel test soprastante si sono mantenuti costanti i valori di ``n`` e ``k`` mentre è stato fatto crescere il valore massimo che i pesi potevano possedere durante la generazione delle istanze (da ``10`` a ``200``). Risulta chiara la dipendenza del metodo di ricerca dinamica da questo fattore.

Per quanto riguarda i metodi di ricerca approssimati il loro tempo di esecuzione è fisso poiché dipende principalmente dai loro parametri interni specifici. Al crescere della dimensione delle istanze ci si aspetta che la performance dei vari algoritmi diminuisca poiché si trovano a dover esplorare, nello stesso numero di iterazioni/passi, uno spazio esponenzialmente maggiore.

Di seguito sono riportati i risultati sperimentali dei valori della funzione obiettivo (somma dei valori degli elementi considerati nella soluzione). In alcune occasioni il metodo del simplesso ha esaurito le iterazioni massime consentite in quanto ha intrapreso un andamento ciclico di cambio di pivot.

n | k | Dynamic | Genetic | Tabu | Simplex | Swarm
-- | -- | -- | -- | -- | -- | --
6 | 2 | 9 | 9 | 9 | 12.285 | 9
7 | 2 | 25 | 25 | 25 | 28.5 | 25
8 | 2 | 29 | 29 | 29 | 28.842 | 29
10 | 2 | 37 | 32 | 37 | 38 | 37
11 | 2 | 29 | 20 | 29 | 29.1 | 29
12 | 2 | 39 | 30 | 39 | 39.75 | 39
13 | 2 | 48 | 36 | 45 | 41 | 48
15 | 2 | 63 | 48 | 63 | 61 | 63
16 | 2 | 49 | 44 | 49 | 44 | 49
17 | 2 | 55 | 40 | 55 | --- | 55
18 | 2 | 47 | 37 | 47 | 48.333 | 47
20 | 2 | 64 | 48 | 62 | 63.111 | 62
21 | 2 | 62 | 49 | 62 | 61.724 | 62
22 | 2 | 68 | 49 | 68 | 62 | 68
23 | 2 | 66 | 43 | 66 | 65 | 66
25 | 2 | 108 | 71 | 108 | 105.966 | 107
26 | 2 | 100 | 70 | 99 | 98.09 | 99
27 | 2 | 102 | 75 | 97 | --- | 101
28 | 2 | 84 | 60 | 75 | 84 | 73
30 | 2 | 100 | 76 | 98 | 99 | 93
31 | 2 | 105 | 75 | 105 | 103 | 100
32 | 2 | 122 | 94 | 117 | 111 | 119
33 | 2 | 128 | 101 | 127 | 128.921 | 118
35 | 2 | 118 | 80 | 114 | 114 | 106
36 | 2 | 133 | 107 | 133 | 129.545 | 129
37 | 2 | 143 | 92 | 143 | 135.117 | 136
38 | 2 | 150 | 120 | 149 | 150.333 | 144
40 | 2 | 126 | 82 | 106 | 121 | 115
41 | 2 | 119 | 81 | 115 | 115.058 | 108
42 | 2 | 137 | 82 | 137 | 138.857 | 130
43 | 2 | 140 | 94 | 134 | --- | 136
45 | 2 | 164 | 111 | 162 | 160 | 155
46 | 2 | 172 | 105 | 170 | --- | 144
47 | 2 | 172 | 117 | 172 | 164 | 144
48 | 2 | 185 | 105 | 177 | 167 | 170
50 | 2 | 157 | 123 | 139 | 141.5 | 148
51 | 2 | 192 | 131 | 187 | 177 | 181
52 | 2 | 185 | 111 | 176 | 167.909 | 173
53 | 2 | 176 | 124 | 173 | --- | 161
55 | 2 | 215 | 155 | 206 | 213 | 191

Il metodo del simplesso produce risultati che occasionalmente superano quelli dati dal metodo esatto considerato come metro di giudizio (*dynamic*) in quanto è ottenuto a partire da un rilassamento del problema in esame.

Il metodo peggiore nell'approssimare le soluzioni ottime è l'algoritmo genetico che comunque raggiunge valori della funzione obiettivo intorno al 70% del massimo ottenibile.

## Conclusioni

Per risolvere problemi complessi la Ricerca Operativa fornisce un ampio ventaglio di  tecniche risolutive che, se opportunamente personalizzate al problema in esame, permette di calcolare soluzioni ottime o comunque sufficientemente buone in un tempo ragionevole ed utilizzando risorse limitate.

Nel caso del problema ``mbk`` esistono molti approcci adatti allo scopo. In questa attività sono stati implementati e descritti solamente alcuni di essi che però forniscono una buona visione d'insieme.

...