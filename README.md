# Meeting Money Tracker

¡Bienvenido a Meeting Money Tracker! 🎤💸

Esta aplicación te ayuda a visualizar cuánto dinero se pierde en tiempo real durante una reunión, calculando el costo según los salarios de los participantes.

## ¿Qué puedes hacer con esta app?
- Agregar empleados con su salario mensual u horario.
- Configurar la duración de la reunión.
- Ver quién está hablando y cuánto tiempo le corresponde.
- Ver el dinero perdido en tiempo real si alguien se pasa de su tiempo o se sale del tema.
- Cambiar de orador fácilmente.

## Instalación y uso rápido (Web)

1. **Clona este repositorio** o descarga los archivos.
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia la app en modo desarrollo:
   ```bash
   npm run dev
   ```
4. Abre tu navegador y ve a la URL que aparece en la terminal (usualmente http://localhost:5173).

## ¿Cómo se usa?
1. Agrega los empleados y sus salarios.
2. Configura la hora de inicio y la duración de la reunión.
3. Haz clic en "Start" para comenzar a trackear el tiempo y el dinero.
4. Usa "Next" para cambiar de orador y "Off-track" si alguien se desvía del tema.
5. Observa el dinero perdido en tiempo real y ¡toma mejores decisiones en tus reuniones!

---

## Usar como extensión de Chrome

1. Ejecuta el build de producción:
   ```bash
   npm run build
   ```
   Esto generará una carpeta `dist` con los archivos listos para la extensión.
2. Abre Chrome y ve a `chrome://extensions`.
3. Activa el modo de desarrollador (arriba a la derecha).
4. Haz clic en "Cargar descomprimida" (Load unpacked).
5. Selecciona la carpeta `dist` generada en el paso 1.
6. ¡Listo! Ahora puedes abrir la extensión desde el icono de Chrome.

---

¿Dudas o sugerencias? ¡Contribuciones y feedback son bienvenidos!
