import { useEffect, useState } from "react";
import API from "../api/axios";

function MedecinDashboard() {

    const [stats, setStats] = useState({
        mes_rendezvous: 0,
        mes_consultations: 0,
        mes_ordonnances: 0,
        mes_patients: 0,
        notifications: 0,
    });

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const res = await API.get("dashboard/medecin/");
            setStats(res.data);
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className="container py-5">

            <h2 className="text-center fw-bold mb-5">
                Dashboard Médecin
            </h2>

            <div className="row g-4">

                <div className="col-md-4">
                    <div className="card shadow border-0 text-center">
                        <div className="card-body">
                            <h5>Mes Rendez-vous</h5>
                            <h1 className="text-danger">
                                {stats.mes_rendezvous}
                            </h1>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card shadow border-0 text-center">
                        <div className="card-body">
                            <h5>Mes Consultations</h5>
                            <h1 className="text-info">
                                {stats.mes_consultations}
                            </h1>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card shadow border-0 text-center">
                        <div className="card-body">
                            <h5>Mes Ordonnances</h5>
                            <h1 className="text-secondary">
                                {stats.mes_ordonnances}
                            </h1>
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card shadow border-0 text-center">
                        <div className="card-body">
                            <h5>Mes Patients</h5>
                            <h1 className="text-success">
                                {stats.mes_patients}
                            </h1>
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card shadow border-0 text-center">
                        <div className="card-body">
                            <h5>Notifications</h5>
                            <h1 className="text-warning">
                                {stats.notifications}
                            </h1>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
}

export default MedecinDashboard;