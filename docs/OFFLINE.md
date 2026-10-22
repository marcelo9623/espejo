# Funcionamiento sin conexión

GitHub se usa solo para **desarrollar y compilar**. La aplicación instalada no necesita Internet.

| Aspecto | Estado |
|---|---|
| Código, estilos y tipografías | Empaquetados en el instalador. La interfaz usa fuentes del sistema (sin CDN ni Google Fonts). |
| Política de seguridad (CSP) | `default-src 'self'`: la interfaz no puede cargar recursos remotos. |
| Cámara, composición, impresión, galería | 100 % locales (a medida que se implementen en las siguientes etapas). |
| Actualizaciones automáticas | **No incluidas.** Se instala manualmente el `.exe`/`.dmg` de cada versión. |
| QR / entrega digital | Dependerán de red (Etapa 6). Sin red, la app avisará y guardará localmente. |

## Antes de un evento
1. Instala el build en el equipo con Internet y ábrelo una vez.
2. Concede el permiso de cámara y verifica la vista previa.
3. Desde ahí el equipo puede operar sin red.
