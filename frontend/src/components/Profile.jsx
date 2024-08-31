import editIcon from '../assets/edit.png'
export default function Profile() {
  return (
    <div className="profile-page-grid">
      <div className="profile-photo">
        <img src="https://www.w3schools.com/images/lamp.jpg" alt="img" />
      </div>
      <div className="profile-name">
        <h1 className="profile-name-h1">Soumyadip Bhattacharjya</h1>
      </div>
      <button className="edit-profile-icon">EDIT</button>
      <div className="meetings">
        <div className="meeting-heading">
          <h1>Meetings</h1>
          <button>Add Meeting</button>
        </div>
        <ul>
          <li>
            <div>
              <div className="meeting-title">System Design Meeting</div>
              <div className="meeting-date">04/09/2024</div>
              <button className="meeting-join-icon">Join</button>
              <button className="meeting-edit-icon">
                <img src={editIcon} alt="hello" />
              </button>
              <button className="meeting-invite">Invite</button>
            </div>
          </li>

          <li>
            <div>
              <div className="meeting-title">Code refactoring Meeting</div>
              <div className="meeting-date">06/09/2024</div>
              <button className="meeting-join-icon">Join</button>
              <button className="meeting-edit-icon">
                <img src={editIcon} alt="hello" />
              </button>
              <button className="meeting-invite">Invite</button>
            </div>
          </li>

          <li>
            <div>
              <div className="meeting-title">System Design Meeting</div>
              <div className="meeting-date">09/09/2024</div>
              <button className="meeting-join-icon">Join</button>
              <button className="meeting-edit-icon">
                <img src={editIcon} alt="hello" />
              </button>
              <button className="meeting-invite">Invite</button>
            </div>
          </li>
        </ul>
      </div>
    </div >
  )
}
