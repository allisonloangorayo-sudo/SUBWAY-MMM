@echo off
echo Iniciando servidor web local para la Presentacion de Subway...
echo Esto soluciona los problemas de seguridad (CORS) del video de Facebook y mapas.
start http://localhost:8000
python -m http.server 8000
