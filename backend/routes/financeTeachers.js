// backend/routes/financeTeachers.js
const express = require('express');

const router = express.Router();

const Payment = require('../models/Payment');
const Class = require('../models/Class');
const Student = require('../models/Student');

const IVA_RATE = 0.02;

router.get('/', async (req, res) => {
  try {
    const now = new Date();

    const month =
      parseInt(req.query.month, 10) ||
      now.getUTCMonth() + 1;

    const year =
      parseInt(req.query.year, 10) ||
      now.getUTCFullYear();

    if (
      !Number.isInteger(month) ||
      month < 1 ||
      month > 12
    ) {
      return res.status(400).json({
        message: 'El mes seleccionado no es válido'
      });
    }

    if (
      !Number.isInteger(year) ||
      year < 2000
    ) {
      return res.status(400).json({
        message: 'El año seleccionado no es válido'
      });
    }

    const start = new Date(
      Date.UTC(year, month - 1, 1)
    );

    const end = new Date(
      Date.UTC(year, month, 1)
    );

    /*
     * Solo se incluyen pagos confirmados
     * dentro del mes seleccionado.
     */
    const payments = await Payment.find({
      paymentDate: {
        $gte: start,
        $lt: end
      },
      status: 'paid'
    }).lean();

    const classIds = [
      ...new Set(
        payments
          .map(payment =>
            payment.classId
              ? String(payment.classId)
              : null
          )
          .filter(Boolean)
      )
    ];

    const studentIds = [
      ...new Set(
        payments
          .map(payment =>
            payment.studentId
              ? String(payment.studentId)
              : null
          )
          .filter(Boolean)
      )
    ];

    const [classes, students] = await Promise.all([
      Class.find({
        _id: {
          $in: classIds
        }
      }).lean(),

      Student.find({
        _id: {
          $in: studentIds
        }
      })
        .select('name')
        .lean()
    ]);

    const classMap = Object.fromEntries(
      classes.map(classItem => [
        String(classItem._id),
        classItem
      ])
    );

    const studentMap = Object.fromEntries(
      students.map(student => [
        String(student._id),
        student
      ])
    );

    const summary = {};

    payments.forEach(payment => {
      const classId = payment.classId
        ? String(payment.classId)
        : '';

      const studentId = payment.studentId
        ? String(payment.studentId)
        : '';

      const classItem = classMap[classId];

      const student = studentMap[studentId];

      const professor =
        classItem?.professor ||
        'Sin profesor';

      const classTitle =
        classItem?.title ||
        'Clase no encontrada';

      const studentName =
        student?.name ||
        'Estudiante no encontrado';

      const ingress = Number(
        payment.amount || 0
      );

      const sessions = Math.max(
        1,
        Number(payment.sessions || 1)
      );

      const payPerSession = Number(
        payment.teacherPayPerSession || 0
      );

      const toPay =
        payPerSession * sessions;

      if (!summary[professor]) {
        summary[professor] = {
          professor,
          totalIngress: 0,
          totalToPay: 0,
          students: {}
        };
      }

      summary[professor].totalIngress +=
        ingress;

      summary[professor].totalToPay +=
        toPay;

      /*
       * Agrupamos los pagos por alumno.
       * Así el alumno aparece una sola vez,
       * aunque haya hecho varios pagos.
       */
      const studentKey =
        studentId ||
        `unknown-${payment._id}`;

      if (
        !summary[professor].students[
          studentKey
        ]
      ) {
        summary[professor].students[
          studentKey
        ] = {
          studentId:
            studentId || null,

          studentName,

          totalPaid: 0,

          paymentCount: 0,

          totalSessions: 0,

          classes: new Set(),

          lastPaymentDate: null
        };
      }

      const studentSummary =
        summary[professor].students[
          studentKey
        ];

      studentSummary.totalPaid +=
        ingress;

      studentSummary.paymentCount += 1;

      studentSummary.totalSessions +=
        sessions;

      studentSummary.classes.add(
        classTitle
      );

      const paymentDate = new Date(
        payment.paymentDate
      );

      const lastPaymentDate =
        studentSummary.lastPaymentDate
          ? new Date(
              studentSummary.lastPaymentDate
            )
          : null;

      if (
        !lastPaymentDate ||
        paymentDate > lastPaymentDate
      ) {
        studentSummary.lastPaymentDate =
          payment.paymentDate;
      }
    });

    const result = Object.values(summary)
      .map(item => {
        const totalIngress = Math.round(
          Number(item.totalIngress || 0)
        );

        const totalToPay = Math.round(
          Number(item.totalToPay || 0)
        );

        const totalVat = Math.round(
          totalToPay * IVA_RATE
        );

        const totalToPayWithVat =
          totalToPay + totalVat;

        const studentsList = Object.values(
          item.students
        )
          .map(student => ({
            ...student,

            classes: Array.from(
              student.classes
            ).sort((a, b) =>
              a.localeCompare(b, 'es')
            )
          }))
          .sort((a, b) =>
            a.studentName.localeCompare(
              b.studentName,
              'es'
            )
          );

        return {
          professor: item.professor,

          totalIngress,

          totalToPay,

          // Monto correspondiente únicamente al 2%
          totalVat,

          // Pago base más 2%
          totalToPayWithVat,

          /*
           * Conservamos la ganancia calculada
           * contra el pago base del profesor.
           */
          totalProfit:
            totalIngress -
            totalToPay,

          students: studentsList
        };
      })
      .sort((a, b) =>
        a.professor.localeCompare(
          b.professor,
          'es'
        )
      );

    res.json(result);
  } catch (err) {
    console.error(
      'Error generando desglose por profesor:',
      err
    );

    res.status(500).json({
      message:
        'Error generando desglose por profesor'
    });
  }
});

module.exports = router;
