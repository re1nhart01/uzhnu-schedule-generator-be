

export type GetUserTokenResponseDTO = {
    access_token: string | null;
    refresh_token: string | null;
    expires_in: number | null;
  };


export type AdminConfigType = {
    forGroup: string;
    days: string[];
    blocks: AdminConfigScheduleBlockType[]
}


export type AdminConfigScheduleBlockType = {
    subjectName: string;
    amountPerWeek: number;
    lecturerName: string;
}