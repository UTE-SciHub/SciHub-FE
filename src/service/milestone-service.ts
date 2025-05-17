import type { Milestone } from "@/models/milestone"
import type { Review } from "@/models/review"
import {
    getMilestonesByTopicId,
    getMilestoneById,
    addReviewToMilestone,
    addMilestone,
    updateMilestone,
} from "@/models/milestone"

import axiosClient from "@/utils/axiosClient";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export class MilestoneService {
    static async getByTopicId(topicId: string) {
        return axiosClient.get(`${BASE_URL}milestones?topicId=${topicId}`);
    }

    static async getById(id: number) {
        await new Promise((resolve) => setTimeout(resolve, 300))

        const milestone = getMilestoneById(id)

        if (!milestone) {
            return {
                status: 404,
                data: {
                    code: 1004,
                    message: "Milestone not found",
                    data: null,
                },
            }
        }

        return {
            status: 200,
            data: {
                code: 1000,
                message: "Success",
                data: milestone,
            },
        }
    }

    static async create(milestone: Milestone) {
        return axiosClient.post(`${BASE_URL}milestones`, milestone);
    }

    static async update(id: number, milestone: Milestone) {
        return axiosClient.put(`${BASE_URL}milestones/${id}`, milestone);
    }

    static async addReview(milestoneId: number, review: Review) {
        await new Promise((resolve) => setTimeout(resolve, 700))

        const success = addReviewToMilestone(milestoneId, review)

        if (!success) {
            return {
                status: 404,
                data: {
                    code: 1004,
                    message: "Milestone not found",
                    data: null,
                },
            }
        }

        return {
            status: 201,
            data: {
                code: 1000,
                message: "Review added successfully",
                data: review,
            },
        }
    }
}
