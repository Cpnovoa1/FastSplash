import React, { Component } from 'react';
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { Navigate } from 'react-router'
import { Link } from 'react-router-dom'
import api from '../url/axios'

class App extends Component {

    state = {
        appointments: [],
        services: [],
        error: [],
        success: [],
        min: '',
        errorc: [],
        valid: [],
        form: {
            _id: '',
            Name: '',
            Adress: '',
            Reference: '',
            Date: '',
            Plate: '',
            cars: '',
            services: '',
            hours: '',
            status: '',
            Obs: ''
        }
    }

    petitionGet = async () => {
        await api.get("admin/services").then(response => {
            this.setState({ services: response.data.service });
        }).catch(error => {
            console.log(error.message);
        })
    }

    petitionPost = async () => {
        const validation = [];
        const temp = [];
        if (!this.state.form || !this.state.form.Name || !this.state.form.Adress || !this.state.form.cars ||
            !this.state.form.services || !this.state.form.hours || !this.state.form.Date ||
            this.state.form.Name === '' || this.state.form.Adress === '' || this.state.form.cars === '' ||
            this.state.form.services === '' || this.state.form.hours === '' || this.state.form.Date === '') {
            temp.push({ message: "Debe llenar todos los campos" });
            this.setState({ errorc: temp });
        } else {
            if (!/^[[A-Za-z]{3}-[\d]{3,4}$/.test(this.state.form.Plate)) {
                temp.push({ message: "Por favor ingrese una placa valida, ejemplo AAA-123" });
                validation.push("Plate");
            }
            if (this.state.form.Date) {
                var today = new Date();
                var yyToday = today.getFullYear();
                var day = today.getDate();
                var mounth = today.getMonth() + 1;

                var dateArr = this.state.form.Date.split("-");
                var yyDate = dateArr[0];
                var mmDate = dateArr[1];

                var dayappoitment = dateArr[2]
                if ((yyDate < yyToday)) {
                    temp.push({ message: "El dia de la cita debe ser mayor a la fecha actual, el año es menor al actual" });
                    validation.push("Date");
                }

                else {
                    if (parseInt(mmDate) < mounth) {
                        temp.push({ message: "El dia de la cita debe ser mayor a la fecha actual, el mes es menor al actual" });
                        validation.push("Date");
                    }
                    else {
                        if (dayappoitment < day && parseInt(mmDate) <= mounth) {
                            temp.push({ message: "El dia de la cita debe ser mayor a la fecha actual, el dia es menor al actual" });
                            validation.push("Date");
                        }

                        else {
                            var day1 = new Date(mmDate + '/' + dayappoitment + '/' + yyDate);
                            var day2 = new Date(today);
                            var difference = Math.round((day1.getTime() - day2.getTime()) / 86400000);
                            if (difference > 15) {
                                temp.push({ message: "El dia de la cita agendada no debe ser mayor a 15 dias" });
                                validation.push("Date");
                            }
                        }
                    }
                }

            }
            if (temp.length == 0) {
                await api.post("appointment", this.state.form).then((response) => {
                    if (!response.data.error) {
                        window.location.href = 'http://localhost:3028/appointments/me';
                    } else {
                        this.setState({ errorc: response.data.error });
                        this.setState({ valid: [] });

                    }
                    console.log(response, "res");
                }).catch((error) => {
                    console.log(error.message, "error");
                })

            }
            else {
                this.setState({ errorc: temp });
                this.setState({ valid: validation });
            }

        }
    }

    selectAppointment = (appointment) => {
        this.setState({
            form: {
                _id: appointment._id,
                Name: appointment.Name,
                Adress: appointment.Adress,
                Reference: appointment.Reference,
                Date: appointment.Date,
                Plate: appointment.Plate,
                cars: appointment.cars,
                services: appointment.services,
                hours: appointment.hours,
                status: appointment.status,
                Obs: appointment.Obs
            }
        })
    }

    handleChange = async e => {
        e.persist();
        const actualUser = JSON.parse(localStorage.getItem('actualUser'));
        await this.setState({
            form: {
                ...this.state.form,
                Name: actualUser._id,
                status: "0",
                services: this.state.form ? this.state.form.services : "",
                Reference: this.state.form ? this.state.form.Reference : ' ',
                Obs: this.state.form ? this.state.form.Obs : ' ',
                hours: this.state.form ? this.state.form.hours : '',
                cars: this.state.form ? this.state.form.cars : '',
                [e.target.name]: e.target.value
            }
        });
        console.log(this.state.form);
    }
    getToday = () => {
        var f = new Date();
        var day = f.getDate();
        if (day <= 9) {
            day = '0' + day;
        }
        var month = f.getMonth() + 1;
        if (month <= 9) {
            month = '0' + month;
        }
        var year = f.getFullYear();
        var today = year + '-' + month + '-' + day;

        this.setState({ min: today });
    }
    componentDidMount() {
        this.petitionGet();
        this.getToday();

    }

    successButton = () => {
        this.setState({ success: [], error: [] });
    }

    render() {
        const { form, min, valid } = this.state;
        const actualUser = JSON.parse(localStorage.getItem('actualUser'));
        if (!actualUser || actualUser.rol != 1) {
            localStorage.clear();
            return (
                <Navigate to='/login' />
            )
        }
        return (
            <div className="row col-md-6 mx-auto">
                {() => {

                }}
                {this.state.success.length > 0 ?
                    <div className="alert alert-success alert-dismissible fade show" role="success">
                        {this.state.success.map((success) => {
                            return (
                                <div>- {success.message}</div>
                            )
                        })}
                        <button type="button" className="btn-close" data-bs-dismiss="success" aria-label="Close" onClick={this.successButton}></button>
                    </div>
                    : ''
                }
                {this.state.errorc.length > 0 ?
                    <div className="alert alert-danger alert-dismissible fade show" role="error">
                        {this.state.errorc.map((error) => {
                            return (
                                <div>- {error.message}</div>
                            )
                        })}
                        <button type="button" className="btn-close" data-bs-dismiss="error" aria-label="Close" onClick={this.successButton}></button>
                    </div>
                    : ''
                }
                <div className="card">
                    <div className='card-header'>
                        <p className='display-6'>Solicitar Cita</p>
                    </div>
                    <div className="card-body">
                        <div className="form-group">
                            <label for="services">Servicio</label>
                            <select name="services" className="form-control mb-3" id="services" value={form ? form.services : 0} onChange={this.handleChange}>
                                <option value="">Seleccione un servicio</option>
                                {this.state.services.map(service => {
                                    return (
                                        <option value={service._id}>{service.name} - ${service.price.toFixed(2)}</option>
                                    )
                                })}
                            </select>
                        </div>
                        <div className="form-floating">
                            <input type="text" name="Adress" id="Adress" className="form-control mb-3" title="Dirección"
                                placeholder="Dirección" value={form ? form.Adress : ''} onChange={this.handleChange} />
                            <label for="Adress">Dirección</label>
                        </div>
                        <div className="form-floating">
                            <input type="text" name="Reference" id="Reference" className="form-control mb-3" title="Referencia"
                                placeholder="Referencia de la dirección" value={form ? form.Reference : ''} onChange={this.handleChange} />
                            <label for="Reference">Referencia de la dirección</label>
                        </div>
                        <div className="form-floating has-validation">
                            <input type="date" name="Date" id="Date" className={valid.includes('Date') ? 'form-control mb-3 form-floating is-invalid' : 'form-control form-floating mb-3'}
                                title="Fecha" value={form ? form.Date : ''} onChange={this.handleChange} min={min} />
                            <label for="Date">Fecha de la cita</label>
                        </div>
                        <div className="form-group">
                            <label for="hours">Hora</label>
                            <select name="hours" className="form-control" id="hours" value={form ? form.hours : 0} onChange={this.handleChange}>
                                <option value="">Seleccione una hora</option>
                                <option value="08:30 - 09:30">08:30 - 09:30</option>
                                <option value="10:30 - 11:30">10:30 - 11:30</option>
                                <option value="12:30 - 13:30">12:30 - 13:30</option>
                                <option value="12:30 - 15:30">12:30 - 15:30</option>
                                <option value="16:30 - 17:30">16:30 - 17:30</option>
                            </select>
                        </div>
                        <hr />
                        <h6 className='display-6 mb-2'>Vehículo</h6>
                        <div className="form-floating has-validation">
                            <input type="text" name="Plate" id="Plate" className={valid.includes('Plate') ? 'form-control mb-3 form-floating is-invalid' : 'form-control form-floating mb-3'} title="Placa"
                                placeholder="Placa" value={form ? form.Plate : ''} onChange={this.handleChange} />
                            <label for="Plate">Placa</label>
                        </div>
                        <div className="form-group">
                            <label for="cars">Modelo</label>
                            <select name="cars" className="form-control" id="cars" value={form ? form.cars : 0} onChange={this.handleChange}>
                                <option value="">Seleccione un modelo</option>
                                <option value="Chevrolet">Chevrolet</option>
                                <option value="Kia">Kia</option>
                                <option value="Hyundai">Hyundai</option>
                                <option value="Haval">Haval</option>
                                <option value="Toyota">Toyota</option>
                            </select>
                        </div>
                        <hr />
                        <div className="form-floating">
                            <input type="text" name="Obs" id="Obs" className="form-control mb-3" title="Observaciones"
                                placeholder="¿Desea añadir alguna observación?" value={form ? form.Obs : ''} onChange={this.handleChange} />
                            <label for="Obs">Observaciones</label>
                        </div>
                        <hr />
                        <div className="form-group d-flex justify-content-end">
                            <button className="btn btn-success mx-1 px-4" onClick={() => this.petitionPost()}>
                                Realizar Cita
                            </button>
                            <Link to="/"><button className="btn btn-danger mx-1">Cancelar</button></Link>
                        </div>
                    </div>
                </div>
            </div>

        );
    }
}
export default App;
