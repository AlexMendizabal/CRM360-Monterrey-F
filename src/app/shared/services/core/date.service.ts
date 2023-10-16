import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DateService {
  months: Array<string> = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  weeks: Array<string> = [
    'Domingo',
    'Lunes',
    'Martes',
    'Miercoles',
    'Jueves',
    'Viernes',
    'Sábado',
  ];

  sameDay(dateA: Date, dateB: Date): boolean {
    return (
      dateA.getFullYear() === dateB.getFullYear() &&
      dateA.getMonth() === dateB.getMonth() &&
      dateA.getDate() === dateB.getDate()
    );
  }

  getHourMinute(date: Date): string {
    const getHours = date.getHours();
    const getMinutes = date.getMinutes();
    let hours: any, minutes: any;

    if (getHours < 10) {
      hours = `0${getHours}`;
    } else {
      hours = getHours;
    }

    if (getMinutes < 10) {
      minutes = `0${getMinutes}`;
    } else {
      minutes = getMinutes;
    }

    return `${hours}:${minutes}`;
  }

  getFullDate(dateA: Date, dateB?: Date, showTime: boolean = true): string {
    const day = dateA.getDate();
    const weekDay = dateA.getDay();
    const month = dateA.getMonth();
    const year = dateA.getFullYear();
    const hour = this.getHourMinute(dateA);

    if (showTime) {
      if (dateB) {
        const hourB = this.getHourMinute(dateB);

        return `${this.weeks[weekDay]}, ${day} de ${this.months[month]} del ${year}, desde ${hour} hasta ${hourB}`;
      }

      return `${this.weeks[weekDay]}, ${day} de ${this.months[month]} del ${year} hasta ${hour}`;
    } else {
      return `${this.weeks[weekDay]}, ${day} de ${this.months[month]} del ${year}`;
    }
  }

  getFullMonth(date: Date): string {
    return this.months[date.getMonth()];
  }

  getFirstDayYear(): Date {
    let date = new Date();
    return new Date(date.getFullYear(), 0, 1);
  }

  getLastDayYear(): Date {
    let date = new Date();
    return new Date(date.getFullYear(), 11, 31);
  }

  getFirstDayMonth(): Date {
    let date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  getLastDayMonth(): Date {
    let date = new Date();
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  }

  getToday(): Date {
    let date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  // Función para obtener la fecha de inicio de la semana actual (lunes)
  getStartOfWeek(): Date {
    const currentDate = new Date();
    const startOfWeek = new Date(currentDate);

    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + (currentDate.getDay() === 0 ? -6 : 1));
    startOfWeek.setHours(0, 0, 0, 0);

    return startOfWeek;
  }

  // Función para obtener la fecha de fin de la semana actual (domingo)
  getEndOfWeek(): Date {
    const currentDate = new Date();
    const endOfWeek = new Date(currentDate);

    endOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 7);
    endOfWeek.setHours(23, 59, 59, 999);

    return endOfWeek;
  }

  convert2PhpDate(date: Date): string {
    const y = date.getFullYear();
    let m: any = date.getMonth() + 1;
    let d: any = date.getDate();
    let h: any = date.getHours();
    let i: any = date.getMinutes();

    if (m < 10) m = `0${m}`;
    if (d < 10) d = `0${d}`;
    if (h < 10) h = `0${h}`;
    if (i < 10) i = `0${i}`;

    return `${y}-${m}-${d} ${h}:${i}`;
  }

  convertToBrazilianDate(date: Date): string {
    let y = date.getFullYear().toString();
    let m = (date.getMonth() + 1).toString().padStart(2, '0');
    let d = date.getDate().toString().padStart(2, '0');
    let h = date.getHours().toString().padStart(2, '0');
    let i = date.getMinutes().toString().padStart(2, '0');
    let s = date.getSeconds().toString().padStart(2, '0');

    return `${d}/${m}/${y} ${h}:${i}:${s}`;
  }

  convertMysqlTime(time: string): string {
    if (time !== null) {
      let timeSplit = time.split(':');

      return `${timeSplit[0]}:${timeSplit[1]}`;
    }

    return time;
  }

  convertToUrlDate(date: Date): string {
    let d: any = date.getDate();
    let m: any = date.getMonth() + 1;
    let y: any = date.getFullYear();

    if (d < 10) d = `0${d}`;
    if (m < 10) m = `0${m}`;

    return `${d}-${m}-${y}`;
  }

  convertStringToDate(stringDate: any, dateType: string): Date {
    let date: Date;

    if (stringDate.indexOf(':') > -1) {
      const stringDateSplit = stringDate.split(' ');
      const dateSplit = stringDateSplit[0].split('-');
      const timeSplit = stringDateSplit[1].split(':');

      if (dateType == 'latam') {
        date = new Date(
          dateSplit[2],
          parseInt(dateSplit[1]) - 1,
          dateSplit[0].substr(0, 2),
          timeSplit[0],
          timeSplit[1],
          timeSplit[2]
        );
      } else if (dateType == 'usa') {
        date = new Date(
          dateSplit[0],
          parseInt(dateSplit[1]) - 1,
          dateSplit[2].substr(0, 2),
          timeSplit[0],
          timeSplit[1],
          timeSplit[2]
        );
      }
    } else {
      const dateSplit = stringDate.split('-');

      if (dateType == 'latam') {
        date = new Date(
          dateSplit[2],
          parseInt(dateSplit[1]) - 1,
          dateSplit[0].substr(0, 2)
        );
      } else if (dateType == 'usa') {
        date = new Date(
          dateSplit[0],
          parseInt(dateSplit[1]) - 1,
          dateSplit[2].substr(0, 2)
        );
      }
    }

    return date;
  }

  formatWithSlashes(stringDate: any, dateType: string): string {
    const dateSplit = stringDate.split('-');
    let date: string;

    if (dateType == 'latam') {
      date = `${dateSplit[2]}/${dateSplit[1]}/${dateSplit[0]}`;
    } else if (dateType == 'usa') {
      date = `${dateSplit[1]}/${dateSplit[2]}/${dateSplit[0]}`;
    }

    return date;
  }

  addDaysToDate(date: Date, days: number): Date {
    return new Date(date.setDate(date.getDate() + days));
  }
}
