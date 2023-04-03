import fs from "fs";
import path from "path";
import axios, { AxiosRequestConfig } from "axios";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: "",
});
const openai = new OpenAIApi(configuration);

const getFiles = (dir: string) => {
  const direcciones: string[] = [];

  const stat = fs.statSync(dir);
  if (stat.isDirectory()) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const direccion = path.join(dir, file);
      direcciones.push(...getFiles(direccion));
    }
  } else {
    direcciones.push(dir);
  }

  return direcciones;
};

class LectorArchivo {
  private direccion_archivo: string;
  carpeta: boolean = false;
  lineas: number = 0;

  constructor(direccion_archivo: string) {
    this.direccion_archivo = direccion_archivo;
  }

  async crearArchivo(dir: string, verticesSalida: number) {
    const res = await this.fetchData();
    const content = res?.data.choices[0].message?.content;

    // crea un .txt con el nombre del archivo y el contenido de la respuesta de openai pero primero coloca el numero de vertices de salida
    fs.writeFileSync(
      path.join(dir, `${path.basename(this.direccion_archivo)}.txt`),
      `Ubicasion del archivo: ${this.direccion_archivo}
      este archivo es usado en: ${verticesSalida}
${content}`
    );

    console.log("Archivo creado");
  }

  async fetchData() {
    const data = fs.readFileSync(this.direccion_archivo, "utf8");

    try {
      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Eres un programador senior que está encargado de documentar el código que te pase.  Eres concreto y vas al grano de como funciona todo. Primoreo índicas la función general de todo el código y de último indica como lo hace.",
          },
          {
            role: "user",
            content: data,
          },
        ],
      });

      return completion;
    } catch (error) {
      console.error("401");
    }
  }

  leer_archivo() {
    // Comprobamos si la dirección del archivo es una carpeta
    try {
      const stats = fs.statSync(this.direccion_archivo);
      if (stats.isDirectory()) {
        this.carpeta = true;
        return getFiles(this.direccion_archivo);
      }
    } catch (err) {
      null;
    }

    // Comprobamos si la dirección del archivo tiene extensión
    this.agregarExtencion();

    const data = fs.readFileSync(this.direccion_archivo, "utf8");

    // Contamos los saltos de línea
    this.lineas = data.split(/\r\n|\r|\n/).length - 1;

    return this.imports(data);
  }

  private imports(data: string) {
    const regex = /from\s+["']([./]+[^"']+)["']/g;
    const matches = data.matchAll(regex);
    const direcciones: string[] = [];

    for (const match of matches) {
      if (match && match.length >= 2) {
        const direccion = path.join(path.dirname(this.direccion_archivo), match[1]);
        direcciones.push(direccion);
      }
    }

    return direcciones;
  }

  private agregarExtencion(): void {
    if (!fs.existsSync(this.direccion_archivo)) {
      // Intentamos agregarle ".ts", ".tsx", ".js" o ".jsx" al nombre del archivo
      const filename = path.basename(this.direccion_archivo);
      const folder = path.dirname(this.direccion_archivo);
      const tsFile = path.join(folder, filename + ".ts");
      const tsxFile = path.join(folder, filename + ".tsx");
      const jsFile = path.join(folder, filename + ".js");
      const jsxFile = path.join(folder, filename + ".jsx");

      if (fs.existsSync(tsFile)) {
        this.direccion_archivo = tsFile;
      } else if (fs.existsSync(tsxFile)) {
        this.direccion_archivo = tsxFile;
      } else if (fs.existsSync(jsFile)) {
        this.direccion_archivo = jsFile;
      } else if (fs.existsSync(jsxFile)) {
        this.direccion_archivo = jsxFile;
      } else {
        // Si no existe el archivo, retornamos un error
        throw new Error(`No se encontró ningún archivo con el nombre ${filename}`);
      }
    }
  }
}

export { LectorArchivo, getFiles };
