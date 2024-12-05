// Importación del componente LoginForm
import LoginForm from "../components/Users/LoginForm"

// Definición del componente LoginPage
function LoginPage(){
    // El componente simplemente renderiza el LoginForm dentro de un div
    return (
        <div>
            <LoginForm></LoginForm>
        </div>
    )
}

// Exportación del componente LoginPage como exportación por defecto
export default LoginPage