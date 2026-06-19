# Guía de Despliegue y Ejecución - AutoPost AI

Esta guía explica cómo configurar y ejecutar el proyecto tanto en tu máquina local como en **Vercel**.

---

## 1. Configuración de Variables de Entorno

El proyecto requiere las siguientes variables para funcionar. Debes configurarlas tanto en local (archivo `.env`) como en el panel de Vercel.

| Variable | Descripción | Dónde obtenerla |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | API Key para la IA de Google | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `VITE_FIREBASE_API_KEY` | Configuración de Firebase | Firebase Console > Project Settings |
| `VITE_FIREBASE_AUTH_DOMAIN` | Configuración de Firebase | Firebase Console > Project Settings |
| `VITE_FIREBASE_PROJECT_ID` | Configuración de Firebase | Firebase Console > Project Settings |
| `VITE_FIREBASE_STORAGE_BUCKET` | Configuración de Firebase | Firebase Console > Project Settings |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Configuración de Firebase | Firebase Console > Project Settings |
| `VITE_FIREBASE_APP_ID` | Configuración de Firebase | Firebase Console > Project Settings |

---

## 2. Despliegue en Vercel (Recomendado)

Vercel detectará automáticamente la configuración gracias al archivo `vercel.json` incluido en la carpeta `client`.

### Pasos:
1.  **Sube tu código a GitHub**: Crea un repositorio y sube el contenido de la carpeta `client`.
2.  **Importar en Vercel**:
    *   Ve a [Vercel](https://vercel.com) y dale a **"Add New" > "Project"**.
    *   Selecciona tu repositorio de GitHub.
3.  **Configurar el Proyecto**:
    *   **Framework Preset**: Vite (se detectará solo).
    *   **Root Directory**: Si subiste todo el repo, asegúrate de que apunte a la carpeta donde está el `package.json` del cliente.
4.  **Añadir Variables de Entorno**:
    *   En la sección "Environment Variables", pega todas las variables de la tabla anterior.
5.  **Deploy**: Dale a **"Deploy"**. ¡Listo!

---

## 3. Ejecución Local (Desarrollo)

Para probar cambios antes de subirlos:

### Requisitos:
*   Node.js instalado (v18 o superior).
*   pnpm instalado (`npm install -g pnpm`).

### Pasos:
1.  **Entra en la carpeta del cliente**:
    ```bash
    cd client
    ```
2.  **Instala las dependencias**:
    ```bash
    pnpm install
    ```
3.  **Configura las variables locales**:
    Crea un archivo `.env.local` en la carpeta `client/` con las variables mencionadas arriba (usa el prefijo `VITE_` para las de Firebase).
4.  **Lanza el servidor de desarrollo**:
    ```bash
    pnpm run dev
    ```
5.  **Nota sobre las APIs**:
    Las funciones en `client/api/*.js` son **Vercel Serverless Functions**. Para que funcionen localmente igual que en Vercel, te recomendamos instalar el **Vercel CLI**:
    ```bash
    npm install -g vercel
    vercel dev
    ```
    Esto levantará tanto el frontend como las APIs de Gemini en un solo comando.

---

## 4. Estructura del Proyecto Fusionado

*   `/client`: El frontend en React + Vite y las APIs de Gemini (Vercel Functions).
*   `/backend`: (Opcional) Contiene las Cloud Functions originales de Firebase si prefieres usar ese backend para tareas pesadas.
*   `vercel.json`: Configura las rutas para que `/api/*` funcione correctamente en el despliegue.

---

## 5. Troubleshooting Común

*   **Error 404 en /api/generarPost**: Asegúrate de que estás desplegando en Vercel o usando `vercel dev` en local. Vite por sí solo no sirve las funciones de la carpeta `api`.
*   **Error de CORS**: Vercel maneja esto automáticamente si las funciones están en la misma zona que el frontend.
*   **Firebase Auth no funciona**: Verifica que el dominio de tu app de Vercel esté en la lista de "Dominios autorizados" en **Firebase Console > Authentication > Settings**.
