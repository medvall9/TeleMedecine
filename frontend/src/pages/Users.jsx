import { useEffect, useState } from "react";
import API from "../api/axios";

function Users() {

    const [users, setUsers] = useState([]);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {

        try {

            const res = await API.get("users/");

            setUsers(res.data);

        }

        catch (err) {

            console.log(err);

        }

    };

    return (

        <div className="container mt-5">

            <h2 className="mb-4">
                Users
            </h2>

            <table className="table table-bordered table-striped">

                <thead>

                    <tr>

                        <th>ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>

                    </tr>

                </thead>

                <tbody>

                    {

                        users.map((user) => (

                            <tr key={user.id}>

                                <td>{user.id}</td>

                                <td>{user.username}</td>

                                <td>{user.email}</td>

                                <td>{user.role}</td>

                            </tr>

                        ))

                    }

                </tbody>

            </table>

        </div>

    );

}

export default Users;