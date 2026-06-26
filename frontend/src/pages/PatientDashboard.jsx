import { useEffect, useState } from "react";
import API from "../api/axios";

function PatientDashboard() {

    const [stats, setStats] = useState({
        mes_rendezvous: 0,
        mes_consultations: 0,
        mes_ordonnances: 0,
        questionnaires: 0,
        notifications: 0,
    });

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const res = await API.get("dashboard/patient/");
            setStats(res.data);
        } catch (err) {
            console.log(err);
        }
    };

    return (

        <div className="container py-5">

            <h2 className="text-center fw-bold mb-5">
                Dashboard Patient
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
                            <h5>Questionnaires</h5>
                            <h1 className="text-success">
                                {stats.questionnaires}
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

export default PatientDashboard;