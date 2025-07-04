# Sistema de Monitoreo de Reuniones de Google Meet

## Descripción General

Este sistema permite automatizar el proceso de monitoreo de reuniones de Google Meet, detectando cuando una reunión ha finalizado y obteniendo automáticamente las transcripciones sin necesidad de intervención manual. El sistema está diseñado para ser eficiente en términos de consumo de tokens de IA y proporcionar una experiencia fluida al usuario.

## Componentes Principales

### 1. Flujos de Trabajo

- **agent.json**: Flujo principal con el agente de IA y herramientas integradas. Proporciona la interfaz de usuario para interactuar con el sistema.
- **sendbottoameeting**: Envía el bot a una reunión de Google Meet y guarda la información de la reunión activa.
- **monitor_meeting.json**: Monitorea periódicamente el estado de la reunión activa y ejecuta la obtención de transcripciones cuando la reunión termina.
- **getbotstatus.json**: Verifica el estado del bot mediante una API.
- **gettranscipts.json**: Obtiene la transcripción completa de una reunión finalizada.

### 2. Archivos de Datos

- **active_meeting.json**: Almacena información sobre la reunión activa actual, incluyendo el ID de la reunión, estado y marca de tiempo.

## Flujo de Trabajo

1. El usuario solicita al agente que envíe el bot a una reunión de Google Meet.
2. El flujo `sendbottoameeting` envía el bot a la reunión y guarda la información en `active_meeting.json`.
3. El flujo `monitor_meeting.json` se ejecuta cada 2 minutos para verificar el estado de la reunión.
4. Cuando se detecta que la reunión ha terminado, el sistema actualiza el estado en `active_meeting.json` y ejecuta automáticamente `gettranscipts.json`.
5. Las transcripciones se obtienen y se entregan al usuario sin necesidad de intervención manual.

## Ventajas del Sistema

- **Eficiencia en consumo de tokens IA**: El monitoreo se realiza sin usar el agente de IA, ahorrando tokens.
- **Automatización completa**: No requiere intervención manual para obtener las transcripciones.
- **Robustez**: El sistema maneja correctamente los estados de la reunión y evita ejecuciones duplicadas.
- **Escalabilidad**: Puede adaptarse fácilmente para manejar múltiples reuniones simultáneas.

## Requisitos

- Directorio `data` para almacenar el archivo `active_meeting.json`.
- Acceso a la API de estado del bot en `https://gateway.dev.vexa.ai/bots/status`.
- Clave API válida para acceder a los servicios.

## Configuración

Asegúrese de que todos los flujos de trabajo estén activados en n8n. El flujo `monitor_meeting.json` debe estar configurado para ejecutarse cada 2 minutos.

## Solución de Problemas

- Si las transcripciones no se obtienen automáticamente, verifique que el flujo `monitor_meeting.json` esté activo y funcionando correctamente.
- Verifique los permisos de lectura/escritura en el directorio `data`.
- Compruebe que la API de estado del bot esté accesible y que la clave API sea válida.

## Extensiones Futuras

- Implementar notificaciones cuando la reunión termine y las transcripciones estén disponibles.
- Añadir un panel de control para visualizar el estado de todas las reuniones activas.
- Integrar con sistemas de calendario para programar reuniones automáticamente.
