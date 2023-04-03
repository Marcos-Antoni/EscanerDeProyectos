import Grafo from "./Grafo";
import { getFiles, LectorArchivo } from "./FS";

/*
1. Pasarle la direccion de los archivos a leer
2. sacar una lista de todos los archivos que hay en la carpeta
3. Recorrer la lista guardandolos en un grafo
4. sacar las importasiones para colocarlos como verticesEntrada
5. recorre todas las importaciones y almazenalos en el grafo si no estan
6. repetir paso 4 y 5 asta que no queden mas importaciones para pasar a otro archivo de la lista del paso 2
7. sacamos el promedio de lineas de los archivos
8. ordenamos los nodos por cantidad de verticesSalida
9. Creamos una documentacion a los 10 archivos con mas verticesSalida usando GPT-3.5
*/

const grafo = new Grafo(""); // direccion de la carpeta donde se guardara la documentacion
const res = getFiles(""); // direccion de la carpeta o archivo a escanear

// grafo.listaNuevosNodos(res);

grafo.cantidadDeNodos();

console.log(`Promedio de lineas: ${grafo.promedioLineas()}`);

grafo.masVerticesSalida();
