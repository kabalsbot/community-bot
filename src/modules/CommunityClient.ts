import { Client, ClientOptions } from "discord.js";
import axios, { AxiosInstance } from "axios";

export default class CommunityClient extends Client {
  http: AxiosInstance;

  constructor(options: ClientOptions) {
    super(options);
    this.http = axios.create({
      baseURL: process.env.API_URL,
      headers: {
        Authorization: process.env.API_TOKEN,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
  }

  async getVotes() {
    const { data } = await this.http.get<{
      data: string[];
      total: number;
    }>("/dblwebhook/list");

    return data.data;
  }

  async getSubscriptions() {
    const { data } = await this.http.get<{
      users: string[];
      total: {
        active: number;
        yearly: number;
        monthly: number;
      };
    }>("/prime/all-subscriptions");

    return data.users;
  }
}
