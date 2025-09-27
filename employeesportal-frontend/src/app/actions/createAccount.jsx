'use server';


export default async function CreateAccount({email, password, password2, firstname, lastname}) {
  let status = null;
  try{
    const res = await fetch(`${process.env.API_URL}api/auth/registration/`, {
      method: 'POST',
      body: JSON.stringify({
        'email': email,
        'password1': password,
        'password2':password2,
        'first_name': firstname,
        'last_name': lastname,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
      status = res.status;
      return status;
  }
  catch (err) {
    return status;
  }
}
