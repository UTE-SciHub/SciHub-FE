import type { Milestone } from "@/models/milestone"
import type { Review } from "@/models/review"

import axiosClient from "@/utils/axiosClient";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export class MilestoneService {
    static async getByTopicId(topicId: string) {
        return axiosClient.get(`${BASE_URL}milestones?topicId=${topicId}`);
    }

    static async getById(id: number) {
        return axiosClient.get(`${BASE_URL}milestones/${id}`);
    }

    static async create(milestone: Milestone) {
        return axiosClient.post(`${BASE_URL}milestones`, milestone);
    }

    static async update(id: number, milestone: Milestone) {
        return axiosClient.put(`${BASE_URL}milestones/${id}`, milestone);
    }

    static async getReviewByMilestoneId(milestoneId: number) {
        return axiosClient.get(`${BASE_URL}reviews?milestoneId=${milestoneId}`);
    }

    static async addReview(review: Review) {
        return axiosClient.post(`${BASE_URL}reviews`, review);
    }

    static async updateReview(id: number, review: Review) {
        return axiosClient.put(`${BASE_URL}reviews/${id}`, review);
    }

    static async deleteReview(id: number) {
        return axiosClient.delete(`${BASE_URL}reviews/${id}`);
    }
}
