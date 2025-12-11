export type Language = 'en' | 'es';

export const translations = {
    en: {
        // General
        searchPlaceholder: 'Search in Drive...',
        myDrive: 'My Drive',
        recentFiles: 'Recent Files',
        starred: 'Starred',
        trash: 'Trash',
        home: 'Home',

        // Dashboard
        newFolder: '+ New Folder',
        dropToUpload: 'Drop files to upload',
        emptyStateTitle: "It's pretty empty here",
        emptyStateDesc: 'Drag and drop files to upload',
        enterFolderName: 'Enter folder name:',

        // Sidebar
        new: 'New',
        uploadFile: 'Upload file',
        uploadFolder: 'Upload folder',
        createFolder: 'New folder',
        storage: 'Storage',
        used: 'used',
        of: 'of',

        // File Preview
        maximize: 'Maximize',
        minimize: 'Restore',
        edit: 'Edit',
        noPreview: 'No preview available for this file type.',
        downloadToView: 'Download to view',

        // File Editor
        savedSuccess: 'Saved successfully!',
        saveFailed: 'Failed to save',
        fileNotFound: 'File not found',
        save: 'Save',
        imageEditingComingSoon: 'Image editing features coming soon.',
        editingNotSupported: 'Editing is not yet supported for this file type in the browser.',
        downloadToEdit: 'Please download the file to edit locally.',

        // Header / User Menu
        lightMode: 'Light Mode',
        darkMode: 'Dark Mode',
        language: 'Español',
        settings: 'Settings',
        signOut: 'Sign Out',
        freePlan: 'Free Plan',

        // Context Menu & Actions
        download: 'Download',
        addToStarred: 'Add to Starred',
        removeFromStarred: 'Remove from Starred',
        moveToTrash: 'Move to Trash',
        restore: 'Restore',
        deleteForever: 'Delete Forever',

        // Settings Modal
        settingsTitle: 'Settings',
        profile: 'Profile',
        dataBackup: 'Data & Backup',
        dangerZone: 'Danger Zone',

        // Profile Tab
        profilePhoto: 'Profile Photo',
        changePhoto: 'Change Photo',
        emailAddress: 'Email Address',
        change: 'Change',
        password: 'Password',
        changePassword: 'Change Password',

        // Data Tab
        exportData: 'Export Data',
        exportDesc: 'Download a complete backup of all your files and folders as a ZIP archive.',
        downloadBackup: 'Download Backup',

        // Danger Tab
        deleteAccount: 'Delete Account',
        deleteDesc: 'Permanently delete your account and all associated data. This action cannot be undone.',
        deleteButton: 'Delete My Account',
        confirmDelete: 'Are you absolutely sure you want to delete your account? This cannot be undone.',

        // Notification
        notifications: 'Notifications',
        noNotifications: 'No notifications',
        close: 'Close',
        preparing: 'Preparing {name}',
        downloading: 'Downloading',
        completed: 'Download complete',
        failed: 'Failed to download',
        downloadStarted: 'Starting download...',

        // Auth / Login
        welcomeBack: 'Welcome Back',
        createAccount: 'Create Account',
        enterCredentials: 'Enter your credentials to access your drive',
        startJourney: 'Start your journey with us today',
        signIn: 'Sign In',
        signUp: 'Sign Up',
        noAccount: "Don't have an account? Sign up",
        hasAccount: 'Already have an account? Sign in',
        emailPlaceholder: 'Email address',
        passwordPlaceholder: 'Password',
    },
    es: {
        // General
        searchPlaceholder: 'Buscar en Drive...',
        myDrive: 'Mi Unidad',
        recentFiles: 'Recientes',
        starred: 'Destacados',
        trash: 'Papelera',
        home: 'Inicio',

        // Dashboard
        newFolder: '+ Nueva Carpeta',
        dropToUpload: 'Suelta archivos para subir',
        emptyStateTitle: 'Está bastante vacío aquí',
        emptyStateDesc: 'Arrastra y suelta archivos para subir',
        enterFolderName: 'Nombre de la carpeta:',

        // Sidebar
        new: 'Nuevo',
        uploadFile: 'Subir archivo',
        uploadFolder: 'Subir carpeta',
        createFolder: 'Nueva carpeta',
        storage: 'Almacenamiento',
        used: 'usado',
        of: 'de',

        // File Preview
        maximize: 'Maximizar',
        minimize: 'Restaurar',
        edit: 'Editar',
        noPreview: 'Vista previa no disponible.',
        downloadToView: 'Descargar para ver',

        // File Editor
        savedSuccess: '¡Guardado con éxito!',
        saveFailed: 'Error al guardar',
        fileNotFound: 'Archivo no encontrado',
        save: 'Guardar',
        imageEditingComingSoon: 'Próximamente edición de imágenes.',
        editingNotSupported: 'La edición no está soportada para este tipo de archivo en el navegador.',
        downloadToEdit: 'Por favor, descarga el archivo para editarlo localmente.',

        // Header / User Menu
        lightMode: 'Modo Claro',
        darkMode: 'Modo Oscuro',
        language: 'English',
        settings: 'Configuración',
        signOut: 'Cerrar Sesión',
        freePlan: 'Plan Gratuito',

        // Context Menu & Actions
        download: 'Descargar',
        addToStarred: 'Añadir a Destacados',
        removeFromStarred: 'Quitar de Destacados',
        moveToTrash: 'Mover a Papelera',
        restore: 'Restaurar',
        deleteForever: 'Eliminar Definitivamente',

        // Settings Modal
        settingsTitle: 'Configuración',
        profile: 'Perfil',
        dataBackup: 'Datos y Copia',
        dangerZone: 'Zona de Peligro',

        // Profile Tab
        profilePhoto: 'Foto de Perfil',
        changePhoto: 'Cambiar Foto',
        emailAddress: 'Dirección de Correo',
        change: 'Cambiar',
        password: 'Contraseña',
        changePassword: 'Cambiar Contraseña',

        // Data Tab
        exportData: 'Exportar Datos',
        exportDesc: 'Descarga una copia de seguridad completa de todos tus archivos y carpetas en un archivo ZIP.',
        downloadBackup: 'Descargar Copia',

        // Danger Tab
        deleteAccount: 'Borrar Cuenta',
        deleteDesc: 'Borra permanentemente tu cuenta y todos los datos asociados. Esta acción no se puede deshacer.',
        deleteButton: 'Borrar Mi Cuenta',
        confirmDelete: '¿Estás completamente seguro de que quieres borrar tu cuenta? Esto no se puede deshacer.',

        // Notification
        notifications: 'Notificaciones',
        noNotifications: 'Sin notificaciones',
        close: 'Cerrar',
        preparing: 'Preparando {name}',
        downloading: 'Descargando',
        completed: 'Descarga completa',
        failed: 'Error al descargar',
        downloadStarted: 'Iniciando descarga...',

        // Auth / Login
        welcomeBack: 'Bienvenido de nuevo',
        createAccount: 'Crear Cuenta',
        enterCredentials: 'Ingresa tus credenciales para acceder',
        startJourney: 'Comienza tu viaje con nosotros hoy',
        signIn: 'Iniciar Sesión',
        signUp: 'Registrarse',
        noAccount: '¿No tienes cuenta? Regístrate',
        hasAccount: '¿Ya tienes cuenta? Inicia sesión',
        emailPlaceholder: 'Correo electrónico',
        passwordPlaceholder: 'Contraseña',
    }
};
