import { LectorArchivo } from "./FS";

type Vertice = {
  id: string;
};

type Nodo = {
  dir: string;
  value: LectorArchivo;
  verticesEntrada: Vertice[];
  verticesSalida: Vertice[];
};

class Grafo {
  private nodos: Map<string, Nodo>;
  private doc: string;

  constructor(doc: string) {
    this.nodos = new Map<string, Nodo>();
    this.doc = doc;
  }

  agregarNodo(dir: string) {
    if (!this.nodos.has(dir)) {
      this.nodos.set(dir, {
        dir,
        value: new LectorArchivo(dir),
        verticesEntrada: [],
        verticesSalida: [],
      });

      const res = this.nodos.get(dir)?.value.leer_archivo();
      res?.map((subDir) => this.conectarNodos(subDir, dir));
    } else {
      return;
    }

    return this.nodos.get(dir);
  }

  conectarNodos(nodoOrigenId: string, nodoDestinoId: string): void {
    const nodoOrigen = this.nodos.get(nodoOrigenId) || this.agregarNodo(nodoOrigenId);
    const nodoDestino = this.nodos.get(nodoDestinoId) || this.agregarNodo(nodoDestinoId);

    nodoOrigen?.verticesSalida.push({ id: nodoDestinoId });
    nodoDestino?.verticesEntrada.push({ id: nodoOrigenId });
  }

  mostrarNodos(): void {
    console.log("Nodos del grafo:");
    for (const nodo of this.nodos.values()) {
      console.log(`Nodo ${nodo.dir}:`);
      console.log("  Vértices que el usa:");
      for (const vertice of nodo.verticesEntrada) {
        console.log(`    ${vertice.id}`);
      }
      console.log("  Vértices que lo usan:");
      for (const vertice of nodo.verticesSalida) {
        console.log(`    ${vertice.id}`);
      }
    }
  }

  listaNuevosNodos(lista: string[]) {
    for (const dir of lista) {
      this.agregarNodo(dir);
    }
  }

  cantidadDeNodos() {
    console.log(`cantidad de nodos: ${this.nodos.size}`);
  }

  promedioLineas() {
    let suma = 0;
    let carpeta = 0;
    for (const nodo of this.nodos.values()) {
      if (nodo.value.carpeta) {
        carpeta++;
      } else {
        suma += nodo.value.lineas;
      }
    }
    return Math.round(suma / (this.nodos.size - carpeta));
  }

  // crea una funcion que debuelva una lista de los 10 nodos con mas verticesSalida
  masVerticesSalida() {
    const lista = [];
    for (const nodo of this.nodos.values()) {
      if (nodo.value.carpeta) continue;
      lista.push({
        dir: nodo.dir,
        verticesSalida: nodo.verticesSalida.length,
        lineas: nodo.value.lineas,
        fun: nodo.value.fetchData,
      });
    }

    lista.sort((a, b) => {
      return b.verticesSalida - a.verticesSalida;
    });

    lista.slice(0, 10).map((nodo) => {
      this.nodos.get(nodo.dir)?.value.crearArchivo(this.doc, nodo.verticesSalida);
    });
  }
}

export default Grafo;
