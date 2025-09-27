'use server';

export default async function fetchWithAutoRefresh(url) {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('access-token')?.value;
    const refreshToken = cookieStore.get('refresh-token')?.value;

    if(!accessToken && !refreshToken){
        // Redirect to the login page to login again
    }else if(!accessToken){
        // Valide the refresh token if not valid redirect to the login page
        // Else Request a new access token from the backend
    }else{
        // validate the access token
    }
}