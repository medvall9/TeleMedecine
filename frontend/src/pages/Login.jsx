import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

function Login() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            const response = await API.post("token/", formData);

            localStorage.setItem("access", response.data.access);
            localStorage.setItem("refresh", response.data.refresh);

            const profile = await API.get("users/profile/");

            const role = profile.data.role;

            if (role === "admin") {
                navigate("/admin");
            }
            else if (role === "medecin") {
                navigate("/medecin");
            }
            else {
                navigate("/patient");
            }

        } catch (error) {

            alert("Nom d'utilisateur ou mot de passe incorrect.");

        }
    };

    return (
        <div className="container mt-5">

            <div className="row justify-content-center">

                <div className="col-md-4">

                    <div className="card shadow">

                        <div className="card-body">

                            <h3 className="text-center mb-4">
                                Login
                            </h3>

                            <form onSubmit={handleSubmit}>

                                <div className="mb-3">

                                    <label>Username</label>

                                    <input
                                        type="text"
                                        name="username"
                                        className="form-control"
                                        onChange={handleChange}
                                    />

                                </div>

                                <div className="mb-3">

                                    <label>Password</label>

                                    <input
                                        type="password"
                                        name="password"
                                        className="form-control"
                                        onChange={handleChange}
                                    />

                                </div>

                                <button
                                    className="btn btn-primary w-100"
                                >
                                    Login
                                </button>

                            </form>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );

}

export default Login;