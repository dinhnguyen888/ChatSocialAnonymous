export interface Account {
  _id?: string;
  email: string;
  password: string;
  name: string;
}

export interface ValidateForm {
  email: string;
  otp: string;
}


