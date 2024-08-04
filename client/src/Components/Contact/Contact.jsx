import "./Contact.css";

export default function Contact() {
  return (
    <div className="contact">
      <span className="contactTitle">Contact</span>
      <form className="contactForm">
        <label htmlFor="username">Username</label>
        <input
          className="contactInput"
          type="text"
          placeholder="Enter your username..."
          id="username"
        />

        <label htmlFor="email">Email</label>
        <input
          className="contactInput"
          type="text"
          placeholder="Enter your email..."
          id="email"
        />

        <label htmlFor="message">Type Your Message</label>
        <textarea
          className="contactInput"
          name="messagee"
          placeholder="Type Your Message"
          id="message"
        ></textarea>

        <button className="contactButton">contact</button>
      </form>
    </div>
  )
}
