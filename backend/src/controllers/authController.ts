import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../utils/prisma";
import { signToken } from "../utils/jwt";

export async function signup(req: Request, res: Response) {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ error: "Email, password, and name are required" });
        }

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(409).json({ error: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: { email, password: hashedPassword, name },
        });

        const token = signToken({ userId: user.id, email: user.email, role: user.role });

        return res.status(201).json({
            token,
            user: { id: user.id, email: user.email, name: user.name, role: user.role },
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Signup failed" });
    }
}

export async function login(req: Request, res: Response) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = signToken({ userId: user.id, email: user.email, role: user.role });

        return res.json({
            token,
            user: { id: user.id, email: user.email, name: user.name, role: user.role },
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Login failed" });
    }
}

export async function me(req: any, res: Response) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { id: true, email: true, name: true, role: true, createdAt: true },
        });
        return res.json({ user });
    } catch (err) {
        return res.status(500).json({ error: "Failed to fetch user" });
    }
}