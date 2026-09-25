/**
 * @file card3d.js
 * @description Librería de Componente Visual Interactivo para Tarjetas 3D con Efecto Tilt, Glow y Flip.
 * @author Samuel Pérez
 * @version 1.0.0
 */

/**
 * Inicializa el comportamiento interactivo 3D en todos los elementos que coincidan con el selector.
 * 
 * Permite interactuar con la tarjeta mediante dos mecánicas:
 * 1. Inclinación y destello dinámico al pasar el cursor (MouseMove).
 * 2. Giro completo de 180° (Flip) manteniendo presionado el clic derecho y arrastrando horizontalmente.
 * 
 * @param {string} [selector='.card'] - Selector CSS del contenedor principal de la tarjeta.
 * @returns {void}
 */
function initInteractive3DCard(selector = '.card') {
    /** @type {NodeListOf<HTMLElement>} */
    const $cards = document.querySelectorAll(selector);

    $cards.forEach($card => {
        /** @type {HTMLElement|null} Subcontenedor con transform-style: preserve-3d */
        const $inner =$card.querySelector('.card-inner');
        /** @type {NodeListOf<HTMLElement>} Capas de brillo radial */
        const $glows =$card.querySelectorAll('.glow');

        /** @type {DOMRect|null} Dimensiones y posición de la tarjeta en el Viewport */
        let bounds = null;
        /** @type {boolean} Estado de arrastre activo del clic derecho */
        let isRightClicking = false;
        /** @type {number} Coordenada X inicial del cursor al hacer clic derecho */
        let startX = 0;
        /** @type {number} Ángulo de rotación Y base persistente (0 o 180 grados) */
        let currentRotationY = 0;
        /** @type {number} Ángulo de rotación Y temporal durante la acción de arrastrar */
        let dragRotationY = 0;

        /**
         * Deshabilita el menú contextual del navegador sobre la tarjeta
         * para habilitar la interacción personalizada de arrastre con clic derecho.
         */
        $card.addEventListener('contextmenu', (e) => e.preventDefault());

        /**
         * Calcula el vector de inclinación (Tilt) y el centro del reflejo (Glow)
         * relativo a la posición actual del puntero sobre la tarjeta.
         * 
         * @param {MouseEvent} e - Evento de movimiento de ratón.
         */
        function rotateToMouse(e) {
            if (!bounds) return;

            const mouseX = e.clientX;
            const mouseY = e.clientY;
            const leftX = mouseX - bounds.x;
            const topY = mouseY - bounds.y;

            // Centro del plano cartesiano de la tarjeta (0,0 en el punto medio)
            const center = {
                x: leftX - bounds.width / 2,
                y: topY - bounds.height / 2
            };

            // Conversión de coordenadas a grados de rotación (inclinación)
            const tiltX = center.y / 15;
            const tiltY = -center.x / 15;
            const totalY = currentRotationY + dragRotationY + tiltY;

            // Aplicación de la matriz de transformación 3D
            $inner.style.transform = `
                scale3d(1.05, 1.05, 1.05)
                rotateX(${tiltX}deg)
                rotateY(${totalY}deg)
            `;

            // Renderizado del gradiente radial para la iluminación dinámica
            $glows.forEach($glow => {$glow.style.backgroundImage = `
                    radial-gradient(
                        circle at
                        ${center.x * 2 + bounds.width / 2}px
                        ${center.y * 2 + bounds.height / 2}px,
                        rgba(255, 255, 255, 0.35),
                        rgba(0, 0, 0, 0.1)
                    )
                `;
            });
        }

        /**
         * Captura el evento de presión de botón de ratón para iniciar el arrastre con clic derecho.
         */
        $card.addEventListener('mousedown', (e) => {
            if (e.button === 2) { // 2 = Clic Derecho
                isRightClicking = true;
                startX = e.clientX;
                $card.style.cursor = 'grabbing';
            }
        });

        /**
         * Listener global para procesar el movimiento del cursor durante el arrastre o la inclinación.
         */
        document.addEventListener('mousemove', (e) => {
            if (isRightClicking) {
                const deltaX = e.clientX - startX;
                dragRotationY = deltaX * 0.8; // Factor de sensibilidad del arrastre
            }
            if (bounds) {
                rotateToMouse(e);
            }
        });

        /**
         * Listener global para finalizar el arrastre del clic derecho y determinar si la tarjeta se voltea.
         */
        document.addEventListener('mouseup', (e) => {
            if (e.button === 2 && isRightClicking) {
                isRightClicking = false;
                $card.style.cursor = 'grab';

                // Umbral de 60 grados para confirmar la vuelta completa de la carta
                if (Math.abs(dragRotationY) > 60) {
                    currentRotationY = (currentRotationY === 0) ? 180 : 0;
                }
                dragRotationY = 0;

                // Transición suave al liberar el clic
                $inner.style.transition = 'transform 0.4s ease';$inner.style.transform = `rotateY(${currentRotationY}deg)`;

                setTimeout(() => {
                    $inner.style.transition = '';
                }, 400);
            }
        });

        /**
         * Registra los límites rectangulares del componente al ingresar el cursor.
         */
        $card.addEventListener('mouseenter', () => {
            bounds = $card.getBoundingClientRect();
        });

        /**
         * Restablece la posición de la tarjeta y limpia efectos al salir el cursor.
         */
        $card.addEventListener('mouseleave', () => {
            bounds = null;
            if (!isRightClicking) {
                $inner.style.transition = 'transform 0.5s ease';$inner.style.transform = `rotateY(${currentRotationY}deg)`;
                $glows.forEach($glow =>$glow.style.backgroundImage = '');
                
                setTimeout(() => {
                    $inner.style.transition = '';
                }, 500);
            }
        });
    });
}