# Sol Común

Demostración de la cooperativa solar de Metepec, Atlixco. Las cifras son ilustrativas y salen de la ficha del piloto: 10 viviendas, 803 kWh al año por casa, $2.00 por kWh y reparto 80/20.

La aplicación corre en el navegador. No usa base de datos ni un servidor propio. El mapa pide las calles a internet; el resto de las pantallas funciona sin conexión.

## Requisitos

- Node.js 22 o superior.
- pnpm 10.34.3. Se instala con npm, que viene con Node. Node 22 también trae Corepack; Node 25 y posteriores, como la 26, ya no lo incluyen.

Comprueba lo que ya tienes:

```bash
node -v
```

Si el número es 22 o mayor, pasa a [Activar pnpm](#activar-pnpm). Si no está instalado, o es una versión anterior, instálalo según tu sistema.

### Linux

Descarga el instalador de Node.js 22 o superior desde [nodejs.org](https://nodejs.org/) y sigue las instrucciones para Linux. Si usas un gestor de versiones, instala con él la rama 22 o una posterior.

Los paquetes de Node que vienen en algunas distribuciones son anteriores a la 22. En ese caso usa el instalador oficial.

### macOS

Descarga el instalador de Node.js 22 o superior desde [nodejs.org](https://nodejs.org/).

Con Homebrew:

```bash
brew install node
```

Si `node -v` sigue por debajo de 22, actualiza la fórmula o usa el instalador de nodejs.org.

### Windows

Descarga el instalador de Node.js 22 o superior desde [nodejs.org](https://nodejs.org/) y déjalo con las opciones que trae, incluida la de agregar Node al PATH. Cierra y vuelve a abrir la terminal después de instalar.

Con winget, en PowerShell:

```powershell
winget install OpenJS.NodeJS
```

Si esa versión queda por debajo de 22, usa el instalador de nodejs.org.

No hace falta WSL.

## Activar pnpm

En Linux, macOS y Windows, en la terminal:

```bash
npm install -g pnpm@10.34.3
pnpm -v
```

`pnpm -v` debe mostrar `10.34.3`. Si en Windows `npm` no se reconoce, cierra la terminal, ábrela de nuevo y repite el comando.

En Windows, si la instalación global pide permisos de administrador, abre PowerShell como administrador, ejecuta el mismo `npm install -g` una vez y vuelve a tu usuario.

## Arrancar en local

Clona el repositorio, entra a la carpeta y arranca el servidor de desarrollo. Los mismos comandos sirven en los tres sistemas:

```bash
git clone <url-del-repositorio>
cd <carpeta>
pnpm install
pnpm dev
```

Abre [http://localhost:5173](http://localhost:5173). El servidor escucha en todas las interfaces del equipo, en el puerto 5173.

Para ver la versión que se publica:

```bash
pnpm build
pnpm preview
```

`pnpm preview` abre [http://localhost:4173](http://localhost:4173).

`pnpm check` revisa que la recuperación, la TIR y las sumas de la cartera sigan coincidiendo con la ficha.

## Publicar en GitHub Pages

Cada push a la rama `main` construye el sitio y lo publica. El archivo está en `.github/workflows/pages.yml`.

En el repositorio de GitHub, entra a Settings, Pages, y en Build and deployment elige GitHub Actions como origen. La dirección queda en `https://<usuario>.github.io/<repositorio>/`.

Las rutas de los archivos son relativas, así que el sitio funciona en esa subcarpeta sin cambiar la configuración.

El mapa carga las calles desde OpenStreetMap. Si ese servicio no responde, la página usa las teselas de CARTO. La búsqueda de una calle que no está en la lista local consulta `photon.komoot.io`. Si esa consulta falla, el resto del demo sigue disponible.
