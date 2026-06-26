import { useEffect, useState } from "react";
import API from "../api/axios";

import { useNavigate } from "react-router-dom";

function AdminDashboard() {

    const [stats, setStats] =useState({
        users: 0,
        patients: 0,
        medecins: 0,
        rendezvous: 0,
        consultations: 0,
        ordonnances: 0,
        questionnaires: 0,
        constantes: 0,
        notifications: 0,
        rapports: 0,
    });
    const navigate = useNavigate();

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const res = await API.get("dashboard/admin/");
            setStats(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="container py-5">

            <h2 className="text-center mb-5 fw-bold">
                Dashboard Admin
            </h2>

            <div className="row g-4">

                <div className="col-md-3">
                    <div className="card shadow text-center border-0">
                        <div className="card-body">
                            <h5 className="fw-bold">Users</h5>
                            <h1 className="text-primary">{stats.users}</h1>
                        </div>
                        <button
    className="btn btn-primary mt-3"
    onClick={() => navigate("/users")}
>
    Voir les utilisateurs
</button>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card shadow text-center border-0">
                        <div className="card-body">
                            <h5 className="fw-bold">Patients</h5>
                            <h1 className="text-success">{stats.patients}</h1>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card shadow text-center border-0">
                        <div className="card-body">
                            <h5 className="fw-bold">Médecins</h5>
                            <h1 className="text-warning">{stats.medecins}</h1>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card shadow text-center border-0">
                        <div className="card-body">
                            <h5 className="fw-bold">Rendez-vous</h5>
                            <h1 className="text-danger">{stats.rendezvous}</h1>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card shadow text-center border-0">
                        <div className="card-body">
                            <h5 className="fw-bold">Consultations</h5>
                            <h1 className="text-info">{stats.consultations}</h1>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card shadow text-center border-0">
                        <div className="card-body">
                            <h5 className="fw-bold">Ordonnances</h5>
                            <h1 className="text-secondary">{stats.ordonnances}</h1>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card shadow text-center border-0">
                        <div className="card-body">
                            <h5 className="fw-bold">Questionnaires</h5>
                            <h1 className="text-dark">{stats.questionnaires}</h1>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card shadow text-center border-0">
                        <div className="card-body">
                            <h5 className="fw-bold">Constantes</h5>
                            <h1 className="text-primary">{stats.constantes}</h1>
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card shadow text-center border-0">
                        <div className="card-body">
                            <h5 className="fw-bold">Notifications</h5>
                            <h1 className="text-warning">{stats.notifications}</h1>
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card shadow text-center border-0">
                        <div className="card-body">
                            <h5 className="fw-bold">Rapports</h5>
                            <h1 className="text-success">{stats.rapports}</h1>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
}

export default AdminDashboard;