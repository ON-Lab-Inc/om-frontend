import React, { Component } from 'react';
import { connect } from 'react-redux';	
import { 
	Button, 
	Modal, 
	ModalHeader, 
	ModalBody, 
	ModalFooter,
	Form,
	FormGroup,
	Label,
	Col,
	Input,
	InputGroup
} from 'reactstrap';
import update from 'immutability-helper';
import { updateProject, addProject } from '../../../actions/projects';

class EditProjectModalForm extends Component {
	constructor() {
		super();
		this.state = { project : null }
	}
	componentWillMount() {
		const { project } = this.props;
		this.setState({ project })
	}
	submit = () => {
		const { project } = this.state;
		const { edit } = this.props;
		const isNew = !edit;

		if (isNew) this.props.addProject(project);
		else this.props.updateProject(project._id, project);

		this.props.toggle();
	}
	onChange = (event) => {
		const newState = update(this.state, 
			{project: {[event.target.name]: {$set: event.target.value}}});
		this.setState(newState)
	}
	render() {
		const { project } = this.state;
		const { edit, toggle } = this.props;
		const isNew = !edit;
		const op = isNew ? 'New' : 'Edit';

		return (
			<Modal isOpen={this.props.show} toggle={toggle} className={this.props.className}>
				<ModalHeader toggle={toggle}>{op} <b>project</b></ModalHeader>
				<ModalBody>
					<Form className='edit-project-form' onSubmit={e => e.preventDefault() && false}>
						<FormGroup row>
							<Label for='name' sm={2}>Name</Label>
							<Col sm={10} className='align-self-center'>
								<Input type="text" name="name" id="name" 
									onChange={this.onChange}
									value={project.name} />
							</Col>
						</FormGroup>
						<FormGroup row>
							<Label for='hours_sold' sm={2}>Hours sold</Label>
							<Col sm={3} className='align-self-center'>
								<Input type="number" name="hours_sold" id="hours_sold" 
									onChange={this.onChange}
									value={project.hours_sold} />
							</Col>
							<Col sm={3} className='align-self-center'>
								<Input type="select" name="hours_sold_unit" id="hours_sold_unit" 
									onChange={this.onChange}
									value={project.hours_sold_unit}>
									<option value='total'>Total</option>
									<option value='monthly'>Monthly</option>
								</Input>
							</Col>
						</FormGroup>
						<FormGroup row>
							<Label for="hourly_rate" sm={2}>Hourly rate</Label>
							<Col sm={10} className='align-self-center'>
								<Input type="text" name="hourly_rate" id="hourly_rate" 
									onChange={this.onChange}
									value={project.hourly_rate} />
							</Col>
						</FormGroup>
					</Form>
				</ModalBody>
				<ModalFooter>
					<Button color="primary" onClick={this.submit}>Done</Button>{' '}
					<Button color="secondary" onClick={toggle}>Cancel</Button>
				</ModalFooter>
			</Modal>
		)
	}
}

const mapDispatchToProps = dispatch => { return {
	updateProject : (pid, update) => dispatch(updateProject(pid, update)),
	addProject : (user) => dispatch(addProject(user))
}}

export default connect(null, mapDispatchToProps)(EditProjectModalForm);