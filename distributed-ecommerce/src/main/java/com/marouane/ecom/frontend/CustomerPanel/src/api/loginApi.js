import axios from 'axios';

export const login = async (loginRequestDTO) => {
    const response = await axios.post('http://localhost:8080/api/auth/authenticate', loginRequestDTO, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    });
    return response.data;
};
