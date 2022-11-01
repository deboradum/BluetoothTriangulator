import { Router } from 'express'
import bluetooth from './bluetooth.route'

const router = Router()

router.use('/bluetooth', bluetooth)

export default router