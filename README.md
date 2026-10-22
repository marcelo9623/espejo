# EMEVE Mirror Selfie Photobooth

Etapa 2: estructura del proyecto + pantalla de inicio con cámara en vivo.

## Subir a GitHub
```bash
git init && git add . && git commit -m "Etapa 2: estructura e inicio"
git branch -M main
git remote add origin https://github.com/<tu-usuario>/emeve-mirror-photobooth.git   # repo privado recomendado
git push -u origin main
```
GitHub Actions (`.github/workflows/ci.yml`) verificará tipos, pruebas y compilación en Windows y macOS.

## Ejecutar localmente (requiere Node 20+)
```bash
npm install
npm run dev        # desarrollo con recarga
npm start          # compila y abre la app
npm run dist       # genera instalador en release/ (NSIS en Windows, DMG en macOS)
```
Cada sistema compila su propio instalador. Para publicar ambos: `git tag v0.2.0 && git push --tags` y descarga los instaladores desde GitHub Releases.

Salida temporal de la app: `Ctrl+Shift+Q`. Modo kiosco de prueba: variable `EMEVE_KIOSK=1`.

## Probar con una cámara real
1. Conecta la webcam y ejecuta `npm run dev`. Concede el permiso si el sistema lo pide.
2. Debes ver la cámara en vivo espejada. Levanta la mano derecha: en el espejo debe verse como en un espejo real.
3. Desconecta la cámara: aparece un aviso y reintenta cada 3 s. Reconéctala: se recupera sola.
4. Toca menos de 0,25 s: no pasa nada. Mantén ≥0,25 s: pasa a la bienvenida y vuelve al inicio tras 10 s.
5. Config y registros: carpeta `userData` de Electron (`%APPDATA%\emeve-mirror-photobooth` en Windows). Edita `config.json` para cambiar textos, fecha (`AAAA-MM-DD`), cámara o `mirrorPreview`.

Más en `docs/OFFLINE.md`.
