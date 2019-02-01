export interface RtaComprobanteModel {
  transaccion: number;
  invoice: string;
  cufe: string;
  estado: string;
  id?: number;
  msj: string;
  ReceivedDateTime?: string;
  ResponseDateTime?: string;
  estadoDIAN?: string;
}
