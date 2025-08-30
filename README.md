# 📝 BlogReactNative

Una aplicación de blog full-stack moderna construida con **React Native/Expo** y **Python Flask**, demostrando el desarrollo móvil multiplataforma con autenticación, gestión de contenido e integración de APIs.

<div align="center">

![React Native](https://img.shields.io/badge/React%20Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

</div>

## 🚀 Características Principales

### 🎯 Funcionalidades Core
- **Autenticación completa** - Sistema de registro e inicio de sesión con JWT
- **Gestión de artículos** - Crear, leer, actualizar y eliminar posts de blog
- **Subida de imágenes** - Soporte para imágenes con preview y optimización
- **Búsqueda inteligente** - Filtrado en tiempo real de artículos
- **Interfaz responsive** - Diseño adaptable para móvil, tablet y web
- **Navegación fluida** - Implementada con Expo Router y file-based routing

### 🛠️ Stack Tecnológico

#### Frontend (React Native/Expo)
- **React Native** 0.79.6 con **Expo SDK** 53
- **TypeScript** para type safety y mejor DX
- **Expo Router** para navegación file-based
- **React Native Reanimated** para animaciones fluidas
- **Expo Image Picker** para manejo de imágenes
- **AsyncStorage** para persistencia local
- **React Navigation** para navegación avanzada

#### Backend (Python Flask)
- **Flask** con arquitectura RESTful
- **Flask-JWT-Extended** para autenticación JWT
- **Flask-CORS** para manejo de CORS
- **SQLite** con lógica de base de datos personalizada
- **Argon2** para hashing seguro de contraseñas
- **Pillow** para procesamiento de imágenes
- **Docker** para containerización

## 📱 Compatibilidad

- ✅ **iOS** (iPhone/iPad)
- ✅ **Android** (Smartphones/Tablets)
- ✅ **Web** (Navegadores modernos)
- ✅ **Responsive Design**

## 🏗️ Arquitectura del Proyecto

```
BlogReactNative/
├── frontend/                 # Aplicación React Native
│   ├── app/                 # Rutas de la aplicación (Expo Router)
│   │   ├── index.tsx        # Pantalla de login/registro
│   │   ├── blog.tsx         # Lista de artículos
│   │   ├── blogpost.tsx     # Crear nuevo artículo
│   │   ├── [blog].tsx       # Vista individual del artículo
│   │   └── _layout.tsx      # Layout principal
│   ├── components/          # Componentes reutilizables
│   │   ├── Blog/           # Lógica y componentes del blog
│   │   ├── Login/          # Autenticación
│   │   └── ui/             # Componentes de UI
│   └── constants.ts         # Configuración y constantes
├── backend/                 # API Python Flask
│   ├── code/               # Código fuente del backend
│   │   ├── app.py          # Aplicación principal Flask
│   │   ├── db_logic_users.py  # Lógica de usuarios
│   │   ├── db_logic_posts.py  # Lógica de posts
│   │   └── requirements.txt   # Dependencias Python
│   ├── db/                 # Base de datos SQLite
│   └── docker-compose.yml  # Configuración Docker
└── README.md               # Documentación principal
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- **Node.js** 18+ y **npm**
- **Python** 3.8+
- **Docker** (opcional, recomendado)
- **Expo CLI** globalmente instalado

```bash
npm install -g @expo/cli
```

### Opción 1: Configuración con Docker (Recomendada)

1. **Clonar el repositorio**
```bash
git clone https://github.com/PC0staS/BlogReactNative.git
cd BlogReactNative
```

2. **Configurar el backend con Docker**
```bash
cd backend
cp .env.example .env  # Configurar variables de entorno
docker-compose up -d
```

3. **Configurar el frontend**
```bash
cd ../frontend
npm install
npm start
```

### Opción 2: Configuración Manual

#### Backend Setup

1. **Navegar al directorio del backend**
```bash
cd backend/code
```

2. **Crear entorno virtual de Python**
```bash
python3 -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

3. **Instalar dependencias**
```bash
pip install -r requirements.txt
```

4. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tu configuración
```

5. **Ejecutar el servidor**
```bash
flask --app app run --host=0.0.0.0 --port=3001 --reload
```

#### Frontend Setup

1. **Navegar al directorio del frontend**
```bash
cd frontend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar la URL del backend**
```bash
# En constants.ts, actualizar BACKEND_URL con tu IP local
export const BACKEND_URL = 'http://TU_IP_LOCAL:3001';
```

4. **Ejecutar la aplicación**
```bash
# Para desarrollo
npm start

# Para plataformas específicas
npm run ios      # iOS Simulator
npm run android  # Android Emulator
npm run web      # Navegador web
```

## 🔧 Scripts Disponibles

### Frontend
```bash
npm start          # Iniciar servidor de desarrollo
npm run android    # Ejecutar en Android
npm run ios        # Ejecutar en iOS
npm run web        # Ejecutar en navegador
npm run lint       # Linter de código
```

### Backend
```bash
flask run --reload          # Servidor con auto-reload
python -m pytest           # Ejecutar tests
docker-compose up          # Ejecutar con Docker
```

## 📚 API Endpoints

### Autenticación
```http
POST /api/auth/signup       # Registro de usuario
POST /api/auth/login        # Inicio de sesión
GET  /api/auth/check        # Verificar token JWT
```

### Usuarios
```http
GET  /api/users/{id}        # Obtener perfil de usuario
```

### Posts del Blog
```http
GET    /api/posts           # Listar todos los posts
GET    /api/posts/{id}      # Obtener post específico
POST   /api/posts           # Crear nuevo post
PUT    /api/posts/{id}      # Actualizar post
DELETE /api/posts/{id}      # Eliminar post
```

### Ejemplo de Uso de API

```javascript
// Crear un nuevo post
const response = await fetch(`${BACKEND_URL}/api/posts`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'Mi nuevo artículo',
    content: 'Contenido del artículo...',
    thumbnail_base64: 'data:image/jpeg;base64,...',
    author: 'Autor del post'
  })
});
```

## 🎨 Características de UI/UX

- **Diseño Material Design** inspirado
- **Animaciones fluidas** con React Native Reanimated
- **Navegación intuitiva** con gestos nativos
- **Tema consistente** a través de toda la aplicación
- **Feedback visual** para todas las interacciones
- **Estados de carga** y manejo de errores
- **Keyboard avoidance** automático en formularios

## 🔐 Seguridad

- **Autenticación JWT** con tokens seguros
- **Hashing de contraseñas** con Argon2
- **Validación de entrada** en frontend y backend
- **Sanitización de datos** para prevenir inyecciones
- **CORS** configurado correctamente
- **Variables de entorno** para datos sensibles

## 🚢 Despliegue

### Backend (Docker)
```bash
cd backend
docker-compose up -d --build
```

### Frontend (Expo)
```bash
cd frontend
# Desarrollo
expo start

# Producción
expo build:android
expo build:ios
expo build:web
```

### Variables de Entorno

Crear `.env` en el directorio `backend/`:
```env
JWT_SECRET_KEY=tu_clave_secreta_jwt_aqui
FLASK_ENV=production
FLASK_DEBUG=0
```

## 🧪 Testing y Linting

```bash
# Frontend
cd frontend
npm run lint              # ESLint + TypeScript

# Backend
cd backend/code
python -m pytest         # Tests unitarios
python -m flake8         # Linting Python
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

### Guías de Contribución
- Seguir las convenciones de código existentes
- Escribir tests para nuevas funcionalidades
- Actualizar documentación según sea necesario
- Usar commits descriptivos

## 🛠️ Tecnologías y Habilidades Demostradas

### Frontend Development
- **React Native/Expo** - Desarrollo móvil multiplataforma
- **TypeScript** - Programación tipada y escalable
- **State Management** - Manejo de estado con hooks
- **Navigation** - Implementación de navegación compleja
- **UI/UX Design** - Interfaces responsive y atractivas
- **Image Handling** - Subida y procesamiento de imágenes
- **API Integration** - Consumo de APIs RESTful

### Backend Development
- **Python/Flask** - Desarrollo de APIs REST
- **Database Design** - Modelado y gestión de datos
- **Authentication** - Sistemas de autenticación seguros
- **Security** - Implementación de mejores prácticas
- **Docker** - Containerización y despliegue
- **API Design** - Arquitectura RESTful bien estructurada

### DevOps y Herramientas
- **Git/GitHub** - Control de versiones y colaboración
- **Docker** - Containerización y orquestación
- **Environment Config** - Gestión de configuraciones
- **Linting/Testing** - Calidad de código y testing

## 📞 Contacto

**PC0staS** - Desarrollador Full Stack

- GitHub: [@PC0staS](https://github.com/PC0staS)
- Proyecto: [https://github.com/PC0staS/BlogReactNative](https://github.com/PC0staS/BlogReactNative)

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

---

<div align="center">

**⭐ Si te gusta este proyecto, no olvides darle una estrella! ⭐**

*Desarrollado con ❤️ por PC0staS*

</div>