import express from "express";
import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import bcrypt from 'bcrypt';
import svgCaptcha from 'svg-captcha';
import fs from "fs";
let captcha = svgCaptcha.create({
    size : 6,
    noise : 2,
    color : true,
    background :"rgb(226, 225, 225)"
});
fs.writeFileSync("captcha.svg", captcha.data);