# TETRIS

1. Preparar el entorno.
    - Crea un archivo index.html con un < canvas > donde se dibujará el juego.
    - Añade un archivo script.js para la lógica.
    - Define el tamaño del canvas (ej. 300x600 px) y el contexto 2D

2. Definir la cuadrícula.
    - El tablero de Tetris es una matriz (ej. 10 columnas x 20 filas).
    - Representa cada celda con un array bidimensional.
    - Inicializa todas las celdas en 0 (vacías).

3. Definir las piezas (Tetrominos).
    - Cada pieza se representa como una matriz de 4x4 con valores 0 y 1.
    - Ejemplo: la pieza “I” (barra)

4. Dibujar tablero y piezas.
    - Usa ctx.fillRect(x, y, width, height) para pintar cada celda.
    - Recorre la matriz del tablero y dibuja las celdas ocupadas.
    - Dibuja la pieza activa en su posición actual.

5. Movimiento de piezas.
    - Cada pieza tiene coordenadas (x, y) en el tablero.
    - Haz que caiga automáticamente con setInterval o requestAnimationFrame.
    - Permite moverla con teclas:
        - Flecha izquierda/derecha → mover en X.
        - Flecha abajo → acelerar caída.
        - Flecha arriba → rotar.

6. Colisiones.
    - Antes de mover o rotar, verifica si la nueva posición es válida:
        - No debe salir del tablero.
        - No debe chocar con celdas ocupadas.
    - Si colisiona al caer, la pieza se “fija” en el tablero

7. Eliminar líneas completas.
    - Revisa cada fila del tablero.
    - Si todas las celdas ≠ 0, elimínala y añade una fila vacía arriba.
    - Incrementa la puntuación.

8. Sistema de puntuación y niveles.
    - +100 puntos por cada línea.
    - Aumenta la velocidad de caída cada cierto número de líneas.
    - Muestra score y nivel en pantalla.

9. Game Over.
    - Si una nueva pieza no cabe en la parte superior, termina el juego.
    - Muestra mensaje y opción de reiniciar.

10. Extras.
    - Colores diferentes para cada pieza.
    - Música o efectos de sonido.
    - Guardar puntuación máxima en localStorage.
